import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import DefaultImage from '../assets/profile.svg';
import BeatLoader from 'react-spinners/BeatLoader';
import '../styles/tailwind.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const currentYear = new Date().getFullYear();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isRecipesLoading, setIsRecipesLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const categories = [
    'Sarapan',
    'Makan Siang',
    'Makan Malam',
    'Camilan',
    'Seafood',
    'Hidangan Pembuka',
    'Hidangan Utama',
    'Hidangan Penutup',
    'Kue/Roti',
    'Minuman',
    'Hidangan Tradisional',
    'Hidangan Sehat',
    'Hidangan Vegetarian',
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsRecipesLoading(true);
        setFetchError(null);
  
        let query = db.collection('recipes');
  
        if (selectedCategory !== '') {
          query = query.where('category', '==', selectedCategory);
        }
  
        if (selectedCreator !== '') {
          query = query.where('author', '==', selectedCreator);
        }
  
        if (selectedTitle !== '') {
          query = query.where('title', '==', selectedTitle);
        }
  
        const snapshot = await query.limit(3).get();
  
        if (snapshot.docs.length === 0) {
         
          setIsRecipesLoading(false);
          return;
        }
  
        const recipesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
  
        const usersSnapshot = await db.collection('users').get();
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        const recipesWithCreator = recipesData.map((recipe) => {
          const creator = usersData.find((user) => user.id === recipe.authorId);
          return {
            ...recipe,
            creatorPhoto: creator?.photoURL || DefaultImage,
          };
        });
  
        setRecipes(recipesWithCreator);
        setFilteredRecipes(recipesWithCreator);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setFetchError('An error occurred while fetching recipes.');
      } finally {
        setIsRecipesLoading(false);
      }
    };
  
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
  
        let query = db.collection('recipes');
  
        if (sortBy) {
          query = query.orderBy(sortBy);
        }
  
        const lastRecommendation = recommendations[recommendations.length - 1];
        if (lastRecommendation) {
          // Assuming 'createdAt' is the field you are using for ordering
          query = query.orderBy('createdAt').startAfter(lastRecommendation.createdAt);
        }
  
        const snapshot = await query.limit(3).get();
  
        if (snapshot.docs.length === 0) {
   
          setIsLoading(false);
          return;
        }
  
        const recommendationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
  
        setRecommendations(recommendations.concat(recommendationsData)); 
      } catch (error) {
        console.error('Error fetching recommendation recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchRecipes();
    fetchRecommendations();
  }, [
    pageNumber,
    sortBy,
    selectedCategory,
    selectedCreator,
    selectedTitle,
    recommendations,
  ]);
  
  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    const filtered = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  const handleSortByChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Selected Sorting Option:', selectedValue);
    setSortBy(selectedValue);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const filtered = category
      ? recipes.filter((recipe) => recipe.category.toLowerCase() === category.toLowerCase())
      : recipes;

    setFilteredRecipes(filtered);
  };

  const handleCreatorChange = (author) => {

    setSelectedCreator(author === allCreatorsOption ? '' : author);
    const filtered = author === allCreatorsOption ? recipes : recipes.filter((recipe) => author === recipe.author);
    setFilteredRecipes(filtered);
  };


  const handleTitleChange = (title) => {
    setSelectedTitle(title);
    const filtered = title ? recipes.filter((recipe) => recipe.title === title) : recipes;
    setFilteredRecipes(filtered);
  };

  const handleNextSlide = () => {
    const totalSlides = Math.ceil(filteredRecipes.length / 20);
    setSlideIndex((prevSlideIndex) => (prevSlideIndex + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    const totalSlides = Math.ceil(filteredRecipes.length / 20);
    setSlideIndex((prevSlideIndex) => (prevSlideIndex - 1 + totalSlides) % totalSlides);
  };

  const handleDescriptionToggle = () => {
    setShowFullDescription((prevShowFullDescription) => !prevShowFullDescription);
  };

  const startIndex = slideIndex * 20;
  const endIndex = startIndex + 20;

  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const uniqueCreators = [...new Set(recipes.map((recipe) => recipe.author))];
  const allCreatorsOption = selectedCreator ? '' : 'All Creators';


  return (
    <div className="bg-purple-700">
      {isRecipesLoading ? (
        <div className="flex items-center justify-center h-48">
          <BeatLoader /> LOADING...
        </div>
      ) : fetchError ? (
        <div>Error: {fetchError}</div>
      ) : (
        <>
<div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16"> 
  <h2 className="text-2xl font-bold text-purple text-center mb-4">
              Resep Masakan
            </h2>
            <p className="text-center text-orange-300 mb-2">
              Anda Bisa Request Untuk Penambahan Features
            </p>
            <SearchBar onSearch={handleSearch} className="flex-1 text-center py-2 px-4" />
            <div className="flex flex-wrap justify-center p-4 mb-4">
              <label htmlFor="sortBy" className="text-orange font-semibold mr-2">
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mb-2 md:mb-0"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                id="creator"
                value={selectedCreator}
                onChange={(e) => handleCreatorChange(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mb-2 md:mb-0"
              >
                <option value="">{allCreatorsOption}</option>
                {uniqueCreators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
              <select
                id="title"
                value={selectedTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mb-2 md:mb-0"
              >
                <option value="">All Titles</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.title}>
                    {recipe.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {currentRecipes.map((recipe) => (
            <div key={recipe.id} className="rounded-lg shadow-md bg-secondary-500 p-4">
                  <div className="mb-2">
                    <Link
                      className="block text-xl font-bold text-blue-700 hover:text-orange-600 transition-colors p-2"
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
                          className="h-52 w-full object-cover rounded-t"
                        />
                      </Link>
                      <p className="text-sm absolute bottom-0 right-0 mb-2 mr-2 italic">
                        © {currentYear} Resep Masakan
                      </p>
                    </div>
                  )}

                  <div className="flex flex-row items-center mb-2">
                    <img
                      src={recipe.creatorPhoto}
                      alt="Creator"
                      className="rounded-full h-8 w-8 object-cover mr-2"
                    />

                    <p className="text-blue-700"> {recipe.author}</p>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={index < recipe.rating ? 'text-yellow-400 mr-1' : 'text-gray-400 mr-1'}
                        />
                      ))}
                    </div>
                    <span className="text-sm p-2 text-gray-600 ml-1 bg-white rounded-full font-bold">{recipe.rating}</span>
                  </div>
                  <p className="text-gray-800 mb-2" onClick={handleDescriptionToggle}>
                    {showFullDescription ? recipe.description : `${recipe.description.slice(0, 50)}...`}
                  </p>
                  <p className="mt-2 text-sm text-white">Kategori: {recipe.category}</p>
                  <p className="text-gray-600 text-sm mb-2">Created: {recipe.createdAt.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {/* Pagination Section */}
            <div className="flex justify-center font-bold mt-4 p-2">
              <button
                className="text-white rounded-full bg-black hover:text-blue-700 focus:outline-none mr-2"
                onClick={handlePrevSlide}
              >
                <FaChevronLeft />
              </button>
              <button
                className="text-white rounded-full bg-black hover:text-blue-700 focus:outline-none"
                onClick={handleNextSlide}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeList;