import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';

const RecipeCard = ({ recipe }) => {
  const { recipeImage, id, title } = recipe;

  return (
    <Link to={`/recipes/${id}`} className="block w-full">
      <div className="border rounded-lg overflow-hidden shadow-md bg-white font-logo hover:shadow-lg transition-shadow">
        <img src={recipeImage} alt="Recipe" className="w-full h-48 object-cover" />
        <div className="p-2">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

const AuthorProfile = () => {
  const { authorId } = useParams();
  const [authorData, setAuthorData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const DEFAULT_PROFILE_IMAGE = 'defaultProfileImage';

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
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
    return <div className="text-center animate-spin">Loading...</div>;
  }

  if (!authorData) {
    return <div>User profile not found.</div>;
  }

  const { displayName, photoURL } = authorData;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <img
          src={photoURL || DEFAULT_PROFILE_IMAGE}
          alt="Author Profile"
          className="w-16 h-16 rounded-full mr-4 object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
          <p className="text-lg font-medium text-gray-600">Recipes Created by {displayName}</p>
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
  );
};

export default AuthorProfile;
