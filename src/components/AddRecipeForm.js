import React, { useState, useEffect } from 'react';
import { Form, Button, FormControl, InputGroup } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { v4 as uuidv4 } from 'uuid';
import { createUserProfileDocument } from '../services/firebase';
import { storage, recipesCollection } from '../services/firebase';
import { db, firebase } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { FaUpload } from "react-icons/fa";

const AddRecipeForm = ({ userAuth }) => {
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    author: userAuth?.displayName || '',
    authorId: userAuth?.uid || '',
    creatorPhoto: userAuth?.photoURL || userAuth?.imageURL || '',
    createdAt: '',
    recipeImage: '',
    recipeVideo: '',
    category: '',
    rating: '',
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isImageUrl, setIsImageUrl] = useState(false);
  const [isVideoUrl, setIsVideoUrl] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
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
    if (userAuth) {
      const { displayName, email, imageURL, photoURL } = userAuth;
      const authorId = userAuth.uid;

      createUserProfileDocument(userAuth, {
        displayName: displayName || 'Unknown',
        email: email || '',
        photoURL: photoURL || imageURL || '',
      });

      setRecipe((prevState) => ({
        ...prevState,
        author: displayName || 'Unknown',
        creatorPhoto: photoURL || imageURL || '',
        authorId: authorId,
      }));
    }
  }, [userAuth]);

  const showNotificationMessage = () => {
    setShowNotification(true);
  };

  const hideNotificationMessage = () => {
    setShowNotification(false);
  };


  const handleAddRecipe = async (recipe) => {
    try {
      setIsLoading(true);
      const authorId = userAuth.uid;
      const recipeRef = recipesCollection.doc(recipe.recipeId);
      await recipeRef.set(recipe);

      const userRef = db.collection('users').doc(authorId);
      await userRef.update({
        activity: firebase.firestore.FieldValue.arrayUnion({
          recipeId: recipe.recipeId,
          recipeName: recipe.title,
          date: firebase.firestore.Timestamp.fromDate(new Date()),
        }),
      });

      setIsLoading(false);
      showNotificationMessage();
      console.log('Recipe added with ID:', recipe.recipeId);
    } catch (error) {
      setIsLoading(false);
      console.error('Error adding recipe:', error);
    }
  };

  const handleChange = (e, index, name) => {
    const { value } = e.target;
    if (name === 'ingredients') {
      const updatedIngredients = [...recipe.ingredients];
      updatedIngredients[index] = value;
      setRecipe((prevState) => ({
        ...prevState,
        ingredients: updatedIngredients,
      }));
    } else if (name === 'instructions') {
      const updatedInstructions = [...recipe.instructions];
      updatedInstructions[index] = value;
      setRecipe((prevState) => ({
        ...prevState,
        instructions: updatedInstructions,
      }));
    } else {
      setRecipe((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddInput = (name) => {
    if (name === 'ingredients') {
      setRecipe((prevState) => ({
        ...prevState,
        ingredients: [...prevState.ingredients, ''],
      }));
    } else if (name === 'instructions') {
      setRecipe((prevState) => ({
        ...prevState,
        instructions: [...prevState.instructions, ''],
      }));
    }
  };

  const handleRemoveInput = (name, index) => {
    if (name === 'ingredients') {
      const updatedIngredients = [...recipe.ingredients];
      updatedIngredients.splice(index, 1);
      setRecipe((prevState) => ({
        ...prevState,
        ingredients: updatedIngredients,
      }));
    } else if (name === 'instructions') {
      const updatedInstructions = [...recipe.instructions];
      updatedInstructions.splice(index, 1);
      setRecipe((prevState) => ({
        ...prevState,
        instructions: updatedInstructions,
      }));
    }
  };
  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    setRecipe((prevState) => ({
      ...prevState,
      recipeImage: imageFile,
    }));
    setIsImageUrl(false);
  };

  const handleVideoChange = (e) => {
    if (e.target.files.length > 0) {
      const videoFile = e.target.files[0];
      setRecipe((prevState) => ({
        ...prevState,
        recipeVideo: videoFile,
      }));
      setIsVideoUrl(false);
    } else {

      const videoURL = e.target.value;
      setRecipe((prevState) => ({
        ...prevState,
        recipeVideo: videoURL,
      }));
      setIsVideoUrl(true);
    }
  };

  const handleImageUrlChange = (e) => {
    const imageURL = e.target.value;
    setRecipe((prevState) => ({
      ...prevState,
      recipeImage: imageURL,
    }));
    setIsImageUrl(true);
  };

  const handleVideoUrlChange = (e) => {
    const videoURL = e.target.value;
    setRecipe((prevState) => ({
      ...prevState,
      recipeVideo: videoURL,
    }));
    setIsVideoUrl(true);
  };

  const uploadImageToStorage = async (recipeImage, uniqueImageName) => {
    try {
      const storageRef = storage.ref().child(`images/${uniqueImageName}`);
      const snapshot = await storageRef.put(recipeImage);
      const recipeImageUrl = await snapshot.ref.getDownloadURL();
      return recipeImageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const uploadVideoToStorage = async (recipeVideo, uniqueVideoName) => {
    try {
      const storageRef = storage.ref().child(`videos/${uniqueVideoName}`);
      const snapshot = await storageRef.put(recipeVideo);
      const recipeVideoUrl = await snapshot.ref.getDownloadURL();
      return recipeVideoUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  const uploadDefaultImageToStorage = async () => {
    try {
      const storageRef = storage.ref().child('images/undefined.png');
      const defaultImageUrl = await storageRef.getDownloadURL();
      return defaultImageUrl;
    } catch (error) {
      console.error('Error uploading default image:', error);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userAuth) {
      console.error('User is not authenticated.');
      return;
    }

    if (isLoading || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (
        !recipe.title ||
        !recipe.description ||
        recipe.ingredients.length === 0 ||
        recipe.instructions.length === 0
      ) {
        setError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      const author = userAuth?.displayName || 'Unknown';
      const creatorPhoto = userAuth?.photoURL || userAuth?.imageURL || 'Unknown';
      const authorId = userAuth.uid;
      const recipeId = uuidv4();
      const createdAt = firebase.firestore.Timestamp.now();
      let recipeImageUrl = recipe.recipeImage;
      let recipeVideoUrl = recipe.recipeVideo;

      if (!isImageUrl) {
        try {
          if (!recipeImageUrl) {
            recipeImageUrl = await uploadDefaultImageToStorage();
          } else {
            const uniqueImageName = `${uuidv4()}-${Date.now()}-${recipeImageUrl.name
              }`;
            recipeImageUrl = await uploadImageToStorage(
              recipeImageUrl,
              uniqueImageName
            );
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          setShowModal(true);
          setIsSubmitting(false);
          return;
        }
      }

      if (isVideoUrl) {
        recipeVideoUrl = recipeVideoUrl.trim();
      } else if (recipeVideoUrl instanceof File) {
        try {
          const uniqueVideoName = `${uuidv4()}-${Date.now()}-${recipeVideoUrl.name}`;
          recipeVideoUrl = await uploadVideoToStorage(recipeVideoUrl, uniqueVideoName);
        } catch (error) {
          console.error("Error uploading video:", error);
          setShowModal(true);
          setIsSubmitting(false);
          return;
        }
      }
      const newRecipe = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        author: author,
        authorId: authorId,
        creatorPhoto: creatorPhoto,
        createdAt: createdAt,
        recipeImage: recipeImageUrl,
        recipeVideo: recipeVideoUrl,
        recipeId: recipeId,
        category: recipe.category,
        rating: recipe.rating,
      };

      await handleAddRecipe(newRecipe);

      setRecipe({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        author: '',
        authorId: '',
        creatorPhoto: '',
        createdAt: '',
        recipeImage: '',
        recipeVideo: '',
        recipeId: '',
        category: '',
        rating: '',
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error adding recipe:', error);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-4 bg-secondary-700 justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">FORM RECIPE</h2>
      <h2 className="text-xl font-bold mb-4 text-center text-white">Resep Masakan Indonesia</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label className="text-white">Nama Resep</Form.Label>
          <FormControl
            as="textarea"
            name="title"
            defaultValue={recipe.title}
            onChange={(e) => handleChange(e, null, 'title')}
            placeholder="Nama Resep"
            className="custom-input w-full h-12 md:h-16 rounded resize-none"
            aria-label="Nama Resep"
          />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label className="text-white">Deskripsi</Form.Label>
          <FormControl
            as="textarea"
            name="description"
            defaultValue={recipe.description}
            onChange={(e) => handleChange(e, null, 'description')}
            placeholder="Deskripsi"
            className="custom-input w-full h-20 md:h-26 rounded resize-vertical"
            aria-label="Deskripsi"
          />
        </Form.Group>

        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-2 text-white">Bahan-Bahan</h4>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={`ingredient-${index}`} className="flex items-center mb-2">
              <span className="mr-2">{index + 1}.</span>
              <div className="custom-input-group flex-grow">
                <textarea
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleChange(e, index, 'ingredients')}
                  placeholder="Bahan"
                  aria-label="Bahan"
                  className="custom-input w-full rounded"
                />
              </div>
              <Button
                onClick={() => handleRemoveInput('ingredients', index)}
                variant="danger"
                className="ml-3 btn-icon text-red-500 hover:text-red-700"
              >
                <Trash />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => handleAddInput('ingredients')}
            variant="primary"
            className="btn-icon bg-white rounded-full px-2 text-center text-orange-500 hover:text-secondary-700"
          >
            Add
          </Button>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-2 text-white">Cara Membuat</h4>
          {recipe.instructions.map((instruction, index) => (
            <div key={`instruction-${index}`} className="flex items-center mb-2">
              <span className="mr-2">{index + 1}.</span>
              <div className="custom-input-group flex-grow">
                <textarea
                  type="text"
                  value={instruction}
                  onChange={(e) => handleChange(e, index, 'instructions')}
                  placeholder="Cara Membuat"
                  aria-label="Cara Membuat"
                  className="custom-input w-full rounded"
                />
              </div>
              <Button
                onClick={() => handleRemoveInput('instructions', index)}
                variant="danger"
                className="ml-3 btn-icon text-red-500 hover:text-red-700"
              >
                <Trash />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => handleAddInput('instructions')}
            variant="primary"
            className="btn-icon bg-white rounded-full px-2 text-center text-orange-500 hover:text-secondary-700"
          >
            Add
          </Button>
        </div>
        <div className="flex justify-center">
          <Form.Group controlId="category" className="text-white">
            <Form.Label className="mr-2">Kategori</Form.Label>
            <Form.Control
              as="select"
              name="category"
              value={recipe.category}
              onChange={(e) => handleChange(e, null, 'category')}
              className="custom-select rounded w-54 bg-yellow-500"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>

        <div className="flex text-center item-center justify-center mt-4 p-2">
          {/* Image */}
          <div className="border rounded p-2">
            <label className="text-center text-white font-bold mb-2 px-2 bg-yellow-500 rounded">Gambar</label>
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <input
                  type="radio"
                  id="imageFromStorage"
                  name="imageSource"
                  checked={!isImageUrl}
                  onChange={() => {
                    setIsImageUrl(false);
                    setRecipe((prevState) => ({
                      ...prevState,
                      recipeImage: '',
                    }));
                  }}
                  aria-label="Pilih Gambar dari Penyimpanan"
                />
                <label htmlFor="imageFromStorage" className="mr-2">
                  Pilih dari Penyimpanan
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="imageFromUrl"
                  name="imageSource"
                  checked={isImageUrl}
                  onChange={() => setIsImageUrl(true)}
                  aria-label="Masukkan URL Gambar"
                />
                <label htmlFor="imageFromUrl">Masukkan URL</label>
              </div>
            </div>
            {!isImageUrl ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="image"
                  onChange={handleImageChange}
                  className="custom-file-input"
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  id="imageUrl"
                  value={recipe.recipeImage}
                  onChange={handleImageUrlChange}
                  placeholder="URL Gambar"
                  aria-label="URL Gambar"
                  className="custom-input"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex text-center item-center justify-center mt-4 p-2">
          {/* Video */}
          <div className="border rounded p-2">
            <label className="text-center text-white font-bold mb-2 px-2 bg-yellow-500 rounded">Video</label>
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <input
                  type="radio"
                  id="videoFromStorage"
                  name="videoSource"
                  checked={!isVideoUrl}
                  onChange={() => {
                    setIsVideoUrl(false);
                    setRecipe((prevState) => ({
                      ...prevState,
                      recipeVideo: '',
                    }));
                  }}
                  aria-label="Pilih Video dari Penyimpanan"
                />
                <label htmlFor="videoFromStorage" className="mr-2">
                  Pilih dari Penyimpanan
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="videoFromUrl"
                  name="videoSource"
                  checked={isVideoUrl}
                  onChange={() => setIsVideoUrl(true)}
                  aria-label="Masukkan URL Video"
                />
                <label htmlFor="videoFromUrl">Masukkan URL</label>
              </div>
            </div>
            {!isVideoUrl ? (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  id="video"
                  onChange={handleVideoChange}
                  className="custom-file-input"
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  id="videoUrl"
                  value={recipe.recipevideo}
                  onChange={handleVideoUrlChange}
                  placeholder="URL Video"
                  aria-label="URL Video"
                  className="custom-input"
                />
              </div>
            )}
          </div>
        </div>
        {/* tombol submit */}
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full flex items-center"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <div className="spinner-border text-light mr-2" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <span>Uploading... Please Wait!!</span>
              </>
            ) : (
              <>
                <FaUpload className="mr-2" /> Upload Resep
              </>
            )}
          </button>
        </div>

        <Link to="/profile" className="text-white mb-2 hover:underline">&lt; Back to Profile</Link>
        <p className="mt-2 text-secondary-500">
          Note : Setelah Berhasil Membuat Resep Silahkan Muat Ulang Halaman
        </p>
      </Form>
      {showNotification && (
        <div className="fixed bottom-5 left-5 bg-gray-100 p-4 rounded shadow-md">
          <p className="text-center text-gray-800">Resep berhasil ditambahkan!</p>
          <button
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => {
              hideNotificationMessage();
              navigate('/');
            }}
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
};

export default AddRecipeForm;
