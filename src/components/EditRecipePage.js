import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { Form, Button, FormControl, InputGroup } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

const EditRecipePage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    category: '',
  });
  const [isImageUrlEdit, setIsImageUrlEdit] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeRef = db.collection('recipes').doc(id);
        const snapshot = await recipeRef.get();

        if (snapshot.exists) {
          const recipeData = snapshot.data();
          setRecipe(recipeData);
        } else {
          console.log('Recipe does not exist.');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleIngredientChange = (e, index) => {
    const { value } = e.target;
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = value;
    setRecipe((prevState) => ({
      ...prevState,
      ingredients: updatedIngredients,
    }));
  };

  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setRecipe((prevState) => ({
      ...prevState,
      recipeImage: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setRecipe((prevState) => ({
      ...prevState,
      recipeImage: file,
    }));
  };

  const handleInstructionChange = (e, index) => {
    const { value } = e.target;
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index] = value;
    setRecipe((prevState) => ({
      ...prevState,
      instructions: updatedInstructions,
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isImageUrlEdit) {
        const recipeRef = db.collection('recipes').doc(id);
        await recipeRef.update(recipe);
        console.log('Recipe updated successfully!');
        navigate(`/recipes/${id}`);
      } else {
        if (!recipe.recipeImage) {
          console.error('Recipe image is required.');
          return;
        }

        const storageRef = storage.ref().child(`images/${recipe.recipeImage.name}`);
        const snapshot = await storageRef.put(recipe.recipeImage);
        const updatedRecipeImageUrl = await snapshot.ref.getDownloadURL();

        const updatedRecipe = { ...recipe, recipeImage: updatedRecipeImageUrl };

        const recipeRef = db.collection('recipes').doc(id);
        await recipeRef.update(updatedRecipe);
        console.log('Recipe with updated image from storage updated successfully!');
        navigate(`/recipes/${id}`);
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };


  return (
    <div className="container mx-auto px-8 py-4 bg-purple-700">
      <Link to="/profile" className="text-orange-300 hover:underline">&lt; Back to Profile</Link>
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Edit Recipe</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label className="text-white">Nama Resep</Form.Label>
          <FormControl
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            placeholder="Masukkan nama resep"
            className="w-full border rounded py-2 px-4 mb-4"
          />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label className="text-white">Deskripsi</Form.Label>
          <FormControl
            as="textarea"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            placeholder="Masukkan deskripsi"
            rows={4}
            className="w-full border rounded py-2 px-4 mb-4"
          />
        </Form.Group>

        <Form.Group controlId="category">
          <Form.Label className="text-white">Kategori</Form.Label>
          <Form.Control
            as="select"
            name="category"
            value={recipe.category}
            onChange={handleChange}
            className="w-auto ml-2 mb-4 mr-2 bg-orange-500 text-white item-center rounded"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">Bahan-Bahan:</h4>
          {recipe.ingredients.map((ingredient, index) => (
            <InputGroup key={index} className="mb-4">
              <textarea
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(e, index)}
                placeholder="Masukkan bahan"
                className="w-full resize-y border rounded py-2 px-4"
                rows={2}
              />
              <Button onClick={() => handleRemoveInput('ingredients', index)} variant="danger">
                <Trash />
              </Button>
            </InputGroup>
          ))}
          <Button onClick={() => handleAddInput('ingredients')} variant="primary" className="btn-icon bg-white rounded-full px-2 text-center text-orange-500 hover:text-secondary-700"
          >
            Add
          </Button>
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2 text-white">Cara Membuat:</h4>
          {recipe.instructions.map((instruction, index) => (
            <InputGroup key={index} className="mb-4">
              <textarea
                type="text"
                value={instruction}
                onChange={(e) => handleInstructionChange(e, index)}
                placeholder="Masukkan instruksi"
                className="w-full resize-y border rounded py-2 px-4"
                rows={2}
              />
              <Button onClick={() => handleRemoveInput('instructions', index)} variant="danger">
                <Trash />
              </Button>
            </InputGroup>
          ))}
          <Button onClick={() => handleAddInput('instructions')} variant="primary" className="btn-icon bg-white rounded-full px-2 text-center text-orange-500 hover:text-secondary-700"
          >
            Add
          </Button>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <input
              type="radio"
              id="imageFromStorageEdit"
              name="imageSourceEdit"
              checked={!isImageUrlEdit}
              onChange={() => setIsImageUrlEdit(false)}
              aria-label="Pilih Gambar dari Penyimpanan"
            />
            <label htmlFor="imageFromStorageEdit" className="mr-2">
              Pilih Gambar dari Penyimpanan
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="imageFromUrlEdit"
              name="imageSourceEdit"
              checked={isImageUrlEdit}
              onChange={() => setIsImageUrlEdit(true)}
              aria-label="Masukkan URL Gambar"
            />
            <label htmlFor="imageFromUrlEdit">Masukkan URL Gambar</label>
          </div>
        </div>
        <div>
          <label className="block text-white font-bold mb-2">Gambar</label>
          {isImageUrlEdit ? (
            <div>
              <input
                type="text"
                id="imageUrlEdit"
                value={recipe.recipeImage}
                onChange={handleImageUrlChange}
                placeholder="URL Gambar"
                aria-label="URL Gambar"
                className="custom-input"
              />
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                id="imageEdit"
                onChange={handleImageChange}
                className="custom-file-input"
              />
            </div>
          )}
        </div>


        <div className="text-center mt-4">
          <Button
            type="submit"
            variant="primary"
            style={{
              display: 'inline-block',
              width: 'auto',
              backgroundColor: 'orange',
              borderRadius: '10px',
            }}
          >
            Simpan Perubahan
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditRecipePage;
