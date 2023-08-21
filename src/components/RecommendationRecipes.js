import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Link, useParams } from 'react-router-dom';
import { recipesCollection, db, isNewRecipe } from '../services/firebase';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const RecommendationRecipes = ({ setUserRecipes }) => {
  const [recommendations, setRecommendations] = useState([]);
  const currentYear = new Date().getFullYear();
  const [isLoading, setIsLoading] = useState(true);
  const { authorId } = useParams();

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

          // Fetch the creator's photo for each recipe
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

          setUserRecipes(recipesWithCreator);
        } else {
          setUserRecipes([]);
        }
      } catch (error) {
        console.error('Error fetching user recipes:', error);
      }
    };

    fetchUserRecipes();
  }, [authorId, setUserRecipes]);


  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);

        const snapshot = await recipesCollection.limit(6).get();
        const recommendationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Fetch the creator's photo for each recipe
        const creatorIds = [...new Set(recommendationsData.map((recipe) => recipe.authorId))];
        const usersSnapshot = await db.collection('users').where('authorId', 'in', creatorIds).get();
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const recommendationsWithCreator = recommendationsData.map((recipe) => {
          const creator = usersData.find((user) => user.authorId === recipe.authorId);
          return {
            ...recipe,
            creatorPhoto: creator?.photoURL || creator?.imageURL || '',
          };
        });

        setRecommendations(recommendationsWithCreator);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recommendation recipes:', error);
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: recommendations.length >= 3 ? 3 : recommendations.length,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          centerMode: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
        },
      },
    ],
  };

  return (
    <div className="recommendation-container mx-auto p-2 max-w-5xl">
      <h2 className="recommendation-title text-3xl font-semibold mb-4 text-primary text-center">
        Saran Resep untuk Anda
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary"></div>
        </div>
      ) : (
        <Slider {...settings}>
          {recommendations.map((recipe) => (
            <div key={recipe.id} className="m-2 item-center items-center justify-center">
              <div className="recipe-card-container relative w-64 mx-auto bg-purple-700 rounded-t-lg item-center text-center">
                <span className="text-xl text-center item-center font-semibold text-yellow-500">
                  {recipe.title}
                </span>
                <div className="rounded shadow-lg bg-purple-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {recipe.recipeImage && (
                    <div className="relative">
                      <img src={recipe.recipeImage} alt="Recipe" className="h-32 w-full p-2 object-cover rounded-t" />
                      <p className="text-sm italic text-white bg-opacity-50">
                        © {currentYear} Resep Masakan
                      </p>
                      <Link
                        className="absolute bottom-0 left-0 w-full h-full p-4 bg-black bg-opacity-50 text-white transition-opacity opacity-0 hover:opacity-100"
                        to={`/recipes/${recipe.id}`}
                      >
                        <p className="text-sm">{recipe.description}</p>
                      </Link>
                    </div>
                  )}

                  <div className="p-4">
                    <Link to={`/author/${recipe.authorId}`}>
                      <div className="flex items-center mb-2">
                        <img
                          src={recipe.creatorPhoto || 'https://via.placeholder.com/30'}
                          alt="Creator"
                          className="rounded-full h-8 w-8 object-cover mr-2"
                        />
                        <p className="text-white font-semibold"> {recipe.author}</p>
                      </div>
                    </Link>
                    <p className="mt-2 text-sm text-white">Kategori: {recipe.category}</p>
                    {/* Add the "New!!" label */}
                    {isNewRecipe(recipe.createdAt) && (
                      <div className="absolute top-4 left-0 font-bold px-2 py-1 rounded-t-lg transform -rotate-45 text-white">
                        New!!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}

      <div className="text-center mt-6 font-semibold">
        <h2>Bingung Mau Masak Apa?? Ayo Cari Rekomendasi Resep yang Cocok untuk di Masak Hari ini..</h2>
      </div>
    </div>
  );
};

export default RecommendationRecipes;

