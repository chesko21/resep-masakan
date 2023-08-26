import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';

const RecipeCard = ({ recipe }) => {
  const { recipeImage, id, title } = recipe;

  return (
    <Link to={`/recipes/${id}`} className="block w-full">
      <div className="border rounded-lg overflow-hidden shadow-md bg-primary-500 font-logo hover:shadow-lg transition-shadow">
        <img src={recipeImage} alt="Recipe" className="w-full h-48 object-cover" />
        <div className="p-2">
          <h3 className="text-lg text-center font-semibold">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

const AuthorProfile = () => {
  const { authorId } = useParams();
  const [authorData, setAuthorData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const DEFAULT_PROFILE_IMAGE = 'defaultProfileImage';

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        setLoading(true);
        const userRef = db.collection('users').doc(authorId);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          setAuthorData(userSnapshot.data());
        } else {
          console.log('User profile not found for authorId:', authorId);
        }

        const userRecipesRef = db.collection('recipes').where('authorId', '==', authorId);
        const recipeSnapshot = await userRecipesRef.get();
        const recipesData = recipeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
        setRecipes(recipesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching author profile:', error);
        setLoading(false);
      }
    };

    fetchAuthorProfile();
  }, [authorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border-t-4 border-blue-500 rounded-full h-12 w-12 animate-spin"></div>
      </div>
    );
  }
  
  if (!authorData) {
    return <div>User profile not found.</div>;
  }

  const { displayName, photoURL } = authorData;

  return (
    <div className="container mx-auto p-4 bg-gray-300 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <div className="flex flex-col md:flex-row items-center mb-4">
          <img
            src={photoURL || DEFAULT_PROFILE_IMAGE}
            alt="Author Profile"
            className="w-16 h-16 rounded-full mb-2 md:mb-0 md:mr-4 object-cover"
          />
          <div>
            <h2 className="text-xl md:text-3xl font-bold mb-1 text-center md:text-left">
              {displayName}
            </h2>
            <p className="text-base md:text-lg font-medium text-gray-600">
              Recipes Created by {displayName}
            </p>
          </div>
        </div>
        {recipes.length === 0 ? (
          <p>No recipes created by this author.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AuthorProfile;
