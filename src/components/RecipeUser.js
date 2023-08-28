import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import DefaultImage from '../assets/profile.svg';

const RecipeUser = ({ authorId }) => {
  const [userRecipes, setUserRecipes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState({});
  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        if (authorId) {
          const userRecipesRef = db.collection('recipes').where('authorId', '==', authorId);
          const recipeSnapshot = await userRecipesRef.get();
          const recipesData = recipeSnapshot.docs.map((doc) => {
            const data = doc.data();
            const dateCreated = data.createdAt ? data.createdAt.toDate() : null;
            return {
              id: doc.id,
              ...data,
              dateCreated: dateCreated,
            };
          });

          const creatorIds = [...new Set(recipesData.map((recipe) => recipe.authorId))];
          const usersSnapshot = await db.collection('users').where('authorId', 'in', creatorIds).get();
          const usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const recipesWithCreator = recipesData.map((recipe) => {
            const creator = usersData.find((user) => user.authorId === recipe.authorId);
            return {
              ...recipe,
              creatorPhoto: creator?.photoURL || creator?.imageURL || '',
            };
          });

          recipesWithCreator.sort((a, b) => b.dateCreated - a.dateCreated);

          setUserRecipes(recipesWithCreator);
        } else {
          setUserRecipes([]);
        }
      } catch (error) {
        console.error('Error fetching user recipes:', error);
      }
    };

    fetchUserRecipes();
  }, [authorId]);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await db.collection('recipes').doc(recipeId).delete();
      setUserRecipes((prevUserRecipes) => prevUserRecipes.filter((recipe) => recipe.id !== recipeId));
      console.log('Recipe deleted successfully!');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleToggleDescription = (recipeId) => () => {
    setShowFullDescription((prevStatus) => ({
      ...prevStatus,
      [recipeId]: !prevStatus[recipeId],
    }));
  };

  const isNewRecipe = (createdAt) => {
    const NEW_RECIPE_DAYS = 7;
    if (!createdAt) return false;

    const now = new Date();
    const diffInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return diffInDays <= NEW_RECIPE_DAYS;
  };

  return (
    <div className="mx-auto bg-primary-200 min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-secondary">
        Resep Collection
      </h2>
      {userRecipes.length === 0 ? (
        <p className="text-secondary text-center">
          Tidak ada resep yang dibuat.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="transition-transform transform hover:scale-105 border rounded-lg overflow-hidden shadow-md hover:shadow-lg bg-gradient-to-br from-purple-700 to-pink-500 relative transition duration-300"
            >
              {isNewRecipe(recipe.dateCreated) && (
                <div className="absolute top-0 left-0 font-bold text-orange-700 mt-3 px-2 rounded-b-lg transform -rotate-45 underline text-white">
                  New!!
                </div>
              )}
              <div className="p-4">
                <Link to={`/recipes/${recipe.id}`}>
                  <h3 className="text-xl font-bold text-center mb-2 text-primary hover:text-accent-500">
                    {recipe.title}
                  </h3>
                </Link>
                <Link to={`/author/${authorId}`} className="text-secondary">
                  <div className="flex items-center mb-2 text-white font-bold hover:underline">
                    <img
                      src={recipe.creatorPhoto || DefaultImage}
                      alt="Creator"
                      className="w-8 h-8 border-2 rounded-full object-cover mr-2"
                    />
                    {recipe.author}
                  </div>
                </Link>
                <Link to={`/recipes/${recipe.id}`}>
                  {recipe.recipeImage && (
                    <img
                      src={recipe.recipeImage}
                      alt={recipe.title}
                      className="w-full h-32 object-cover mb-2 rounded-lg"
                    />
                  )}
                </Link>
                <div className="text-center rounded-lg p-2">
                  <p
                    className={`${
                      showFullDescription[recipe.id] ? "h-auto" : "h-12"
                    } overflow-hidden text-white`}
                    onClick={handleToggleDescription(recipe.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {recipe.description}
                  </p>
                </div>
                {!showFullDescription[recipe.id] &&
                  recipe.description.split(" ").length > 12 && (
                    <button
                      className="text-white hover:text-primary-500 focus:outline-none mt-2"
                      onClick={handleToggleDescription(recipe.id)}
                    >
                      Lihat Selengkapnya
                    </button>
                  )}
                <p className="mt-2 text-sm">Kategori: {recipe.category}</p>
                <p className="text-white text-sm mt-2">
                  Created: {recipe.dateCreated?.toLocaleDateString()}
                </p>
                <div className="flex mt-4 justify-center space-x-4">
                  <button
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg flex items-center hover:bg-red-600 transition-colors duration-300"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <FiTrash2 className="mr-1 text-sm" />
                    Delete
                  </button>
                  <Link
                    to={`/recipes/edit/${recipe.id}`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-300"
                  >
                    <FiEdit className="mr-1 text-sm" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeUser;
