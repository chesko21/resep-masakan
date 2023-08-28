import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { firestore } from "../services/firebase";
import { motion } from "framer-motion";

const TrandingPage = () => {
  const [trandingRecipes, setTrandingRecipes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const recipesPerPage = 8;

  useEffect(() => {
    const fetchTrandingRecipes = async () => {
      try {
        const recipesSnapshot = await firestore.collection("recipes").get();
        const allRecipes = recipesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        allRecipes.forEach((recipe) => {
          const score = recipe.rating || 0;
          recipe.trendScore = score;
        });

        allRecipes.sort((a, b) => b.trendScore - a.trendScore);

        setTrandingRecipes(allRecipes);
      } catch (error) {
        console.error("Error fetching trending recipes:", error);
      }
    };

    fetchTrandingRecipes();
  }, []);

  const handleNextRecipes = () => {
    setStartIndex((prevIndex) => prevIndex + recipesPerPage);
  };

  const handlePrevRecipes = () => {
    setStartIndex((prevIndex) => Math.max(prevIndex - recipesPerPage, 0));
  };

  const displayedRecipes = trandingRecipes.slice(
    startIndex,
    startIndex + recipesPerPage
  );

  return (
    <div className="bg-gradient-to-tl from-blue-500 via-wavy-purple to-accent-400 min-h-screen">
      <div className="container mx-auto px-8 py-4">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Resep Lagi Tranding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className="story-card p-6 bg-gradient-to-br from-purple-500 to-accent-600 rounded-lg
               shadow-md hover:shadow-lg
                transition duration-300 transform hover:scale-105"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 0.9 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1, opacity: 0.9, rotate: 15 }}
            >
              <div className="relative mb-4">
                <img
                  src={recipe.recipeImage}
                  alt={recipe.title}
                  className="rounded-lg w-full h-auto"
                />
                <div className="absolute inset-0 rounded-lg bg-black opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={recipe.creatorPhoto}
                    alt={`Author: ${recipe.author}`}
                    className="rounded-full w-12 h-12 object-cover border-2 border-white"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {recipe.title}
              </h3>
              <p className="text-primary-300 mb-2">
                {recipe.description.length > 30
                  ? `${recipe.description.slice(0, 30)}...`
                  : recipe.description}
              </p>

              <p className=" mb-2">Author: {recipe.author}</p>
              <Link
                to={`/recipes/${recipe.id}`}
                className="text-secondary-500 hover:underline"
              >
                Lihat Resep
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <motion.button
            onClick={handlePrevRecipes}
            className="px-2 py-2 rounded-full bg-gray-300 hover:bg-gray-400 transition duration-300 mr-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={handleNextRecipes}
            className="px-2 py-2 rounded-full bg-gray-300 hover:bg-gray-400 transition duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Next
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TrandingPage;
