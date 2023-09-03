import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { firebase, auth } from "../services/firebase";
import { motion } from "framer-motion";
import BeatLoader from "react-spinners/BeatLoader";
import FavoriteButton from "../button/FavoriteButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TrandingPage = () => {
  const [trandingRecipes, setTrandingRecipes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const recipesPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchTrandingRecipes = async () => {
      try {
        const recipesSnapshot = await firebase.firestore().collection("recipes").get();
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending recipes:", error);
        setLoading(false);
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
    <div className="relative bg-gradient-to-bl from-accent-500 via-wavy-purple to-secondary-500 h-min-screen">
      <div className="container mx-auto px-8 py-4">
        <h2 className="text-3xl font-logo mb-4 text-secondary-900">
          Resep Lagi Trending
        </h2>

        {loading ? (
          <div className="flex justify-center items-center font-logo min-h-screen">
            <BeatLoader /> LOADING...
          </div>
        ) : fetchError ? (
          <div className="text-red-500">Error: {setFetchError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                className="border-2 p-4 bg-wavy-purple rounded-lg hover:shadow-lg
                transition duration-100 transform hover:scale-105
                text-center mb-4 shadow-lg-dark"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 0.9, rotate: 0 }}
                exit={{ opacity: 1 }}
                whileHover={{ scale: 1, opacity: 1, rotate: 15 }}
              >
                <div className="relative mb-4">
                  <img
                    src={recipe.recipeImage}
                    alt={recipe.title}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-lg bg-black opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={recipe.creatorPhoto || "userProfilePhotoURL"}
                      alt="User Profile"
                      className="rounded-full w-14 h-14 object-cover border-2 border-white"
                    />
                  </div>
                </div>
                <h3 className="text-xl mb-2 font-bold">
                  {recipe.title}
                </h3>
                <p className="mb-4 font-logo">
                  {recipe.description.length > 30
                    ? `${recipe.description.slice(0, 30)}...`
                    : recipe.description}
                </p>
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="text-white px-2 mb-4 hover:bg-yellow-500 border rounded"
                >
                  Lihat Resep
                </Link>

                <p className="text-secondary-900 mt-2 mb-2">
                  Author: {recipe.author}
                </p>
                <div>
                  <FavoriteButton
                    userId={auth.currentUser ? auth.currentUser.uid : null}
                    recipeId={recipe.id}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <motion.button
            onClick={handlePrevRecipes}
            className="px-2 py-2 font-logo rounded-full bg-gray-300 hover:bg-gray-400 transition duration-300 mr-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft />
          </motion.button>
          <motion.button
            onClick={handleNextRecipes}
            className="px-2 py-2 font-logo rounded-full bg-gray-300 hover:bg-gray-400 transition duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
           <FaChevronRight />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TrandingPage;
