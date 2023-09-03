import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { Link, useParams } from "react-router-dom";
import defaultProfileImage from "../assets/profile.svg";


const Favorites = ({ userId, authorId, photoURL }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        const userRef = db.collection("users").doc(userId);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();

          const favorites = userData.favorites || [];

          const favoriteRecipesData = await Promise.all(
            favorites.map(async (recipeId) => {
              const recipeRef = db.collection("recipes").doc(recipeId);
              const recipeSnapshot = await recipeRef.get();

              if (recipeSnapshot.exists) {
                const recipeData = recipeSnapshot.data();
                return {
                  id: recipeId,
                  ...recipeData,
                };
              } else {
                return null;
              }
            })
          );

          const filteredFavoriteRecipes = favoriteRecipesData.filter(
            (recipe) => recipe !== null
          );

          setFavoriteRecipes(filteredFavoriteRecipes);
        }
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    };

    fetchFavoriteRecipes();
  }, [userId, recipe]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const recipeDoc = await db.collection("recipes").doc(id).get();
        if (recipeDoc.exists) {
          const recipeData = {
            id: recipeDoc.id,
            ...recipeDoc.data(),
            createdAt: recipeDoc.data().createdAt.toDate(),
          };

          const recipeAuthorId = recipeData.authorId;
          if (recipeAuthorId !== authorId) {
            const userDoc = await db
              .collection("users")
              .doc(recipeAuthorId)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              recipeData.creatorPhoto =
                userData.photoURL || photoURL || defaultProfileImage;
            }
          } else {
            recipeData.creatorPhoto = photoURL || defaultProfileImage;
          }

          setRecipe(recipeData);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, authorId, photoURL, isLoading]);

  return (
    <div className="mx-auto bg-primary-200 min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-secondary">
        Favorite Recipes
      </h2>
      {favoriteRecipes.length === 0 ? (
        <p className="text-secondary text-center font-logo">No favorite recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="transition-transform transform hover:scale-105 border rounded-lg overflow-hidden shadow-md hover:shadow-lg bg-gradient-to-br from-purple-700 to-pink-500 relative transition duration-300"
            >
              <div className="mb-2 text-center">
                <Link
                  className="block text-xl font-bold text-white hover:text-secondary-700 transition-colors p-2"
                  to={`/recipes/${recipe.id}`}
                >
                  {recipe.title}
                </Link>
              </div>
              {recipe.recipeImage && (
                <div className="mb-4 relative">
                  <Link to={`/recipes/${recipe.id}`}>
                    <img
                      src={recipe.recipeImage}
                      alt="Recipe"
                      className="h-32 md:h-40 w-full object-cover rounded-t"
                    />
                  </Link>
                </div>
              )}
              <Link to={`/author/${recipe.authorId}`}>
                <div className="flex flex-row items-center mb-2 ">
                  <img
                    src={recipe.creatorPhoto}
                    alt="Creator"
                    className="rounded-full border-2 h-8 w-8 object-cover hover:bg-secondary-700 mr-2"
                  />
                  <p className="text-white font-bold rounded hover:bg-secondary-700">
                    {recipe.author}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
