import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db, commentsCollection } from '../services/firebase';
import { FaUtensils, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import CommentList from '../utils/CommentList';
import { BsCheckCircle, BsFillStarFill } from 'react-icons/bs';
import Rating from '../utils/Rating';
import BeatLoader from 'react-spinners/BeatLoader';
import defaultProfileImage from '../assets/profile.svg';

const RecipeDetail = ({ authorId, photoURL, user, setAverageRating }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);


  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const recipeDoc = await db.collection('recipes').doc(id).get();
        if (recipeDoc.exists) {
          const recipeData = {
            id: recipeDoc.id,
            ...recipeDoc.data(),
            createdAt: recipeDoc.data().createdAt.toDate(),
          };

          // Fetch the creator's photo for the recipe if it's not already passed as a prop
          const recipeAuthorId = recipeData.authorId;
          if (recipeAuthorId !== authorId) {
            const userDoc = await db.collection('users').doc(recipeAuthorId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              recipeData.creatorPhoto = userData.photoURL || photoURL || defaultProfileImage;
            }
          } else {
            recipeData.creatorPhoto = photoURL || defaultProfileImage;
          }

          setRecipe(recipeData);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, authorId, photoURL]);


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const snapshot = await commentsCollection.where('recipeId', '==', id).get();
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(commentsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (comment) => {
    try {
      const newComment = {
        recipeId: id,
        content: comment,
        rating: hasRated ? 0 : currentRating,
        likes: [],
        user: {
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL,
        },
      };

      const docRef = await commentsCollection.add(newComment);
      const newCommentWithId = { id: docRef.id, ...newComment };

      setComments([...comments, newCommentWithId]);

      if (hasRated) {
        const userAuth = auth.currentUser;
        if (userAuth) {
          const authorId = userAuth.uid;
          const ratingDocRef = db.collection('recipes').doc(id).collection('ratings').doc(authorId);
          await ratingDocRef.set({ rating: currentRating });

          const recipeDocRef = db.collection('recipes').doc(id);
          const recipeDoc = await recipeDocRef.get();
          if (recipeDoc.exists) {
            const recipeData = recipeDoc.data();
            const comments = recipeData.comments || [];
            const userComment = comments.find((comment) => comment.authorId === authorId);
            if (userComment) {
              userComment.rating = currentRating;
              const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0) + currentRating;
              const average = totalRating / (comments.length + 1);
              setAverageRating(average.toFixed(1));
              await recipeDocRef.update({ rating: average.toFixed(1), comments });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleRatingChange = (rating) => {
    setCurrentRating(rating);
    setHasRated(true);
    setUserRating(rating);
  };


  const handleReplyComment = async (parentId, replyContent) => {
    try {
      if (parentId) {
        const newReply = {
          content: replyContent,
          likes: 0,
        };
        await commentsCollection.doc(parentId).collection('replies').add(newReply);
      } else {
        const newComment = {
          recipeId: id,
          content: replyContent,
          rating: 0,
          likes: [],
        };

        const docRef = await commentsCollection.add(newComment);
        const newCommentWithId = { id: docRef.id, ...newComment };

        setComments([...comments, newCommentWithId]);
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const shareOnFacebook = (recipe) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnInstagram = (recipe) => {
    // You can't directly share on Instagram programmatically due to platform limitations.
    // Instead, provide instructions to users on how to share manually.
    alert('To share on Instagram, open the app and upload the recipe image along with the title and description.');
  };

  const shareOnWhatsApp = (recipe) => {
    const shareText = `Check out this delicious recipe: ${recipe.title}\n\n${recipe.description}\n\n${window.location.href}`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };


  if (isLoading || !recipe) {
    return (
      <div className="flex items-center justify-center h-48 bg-purple-200">
        <BeatLoader /> LOADING....
      </div>
    );
  }

  return (
    <div className="p-6 lg:px-12 xl:px-24 bg-purple-100">
      <Link to="/recipe-list" className="text-blue-500 hover:underline">&lt; Back to Recipes</Link>
      <h2 className="text-3xl font-semibold text-center mt-4">{recipe.title}</h2>
      <div className="relative mt-4">
        {recipe.recipeImage && (
          <img src={recipe.recipeImage} alt="Recipe" className="h-64 w-full object-cover rounded-md shadow-lg" />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white">
          <div className="flex flex-row items-center mb-2">
            <img
              src={recipe.creatorPhoto || user.photoURL}
              alt="Creator"
              className="rounded-full h-12 w-12 object-cover mr-2"
            />
            <p className="text-orange-500 font-bold text-lg"> {recipe.author}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-center text-gray-700 mt-4">{recipe.description}</p>
      </div>

      <div className="mt-8 bg-white bg-gradient-to-br from-white to-gray-300 p-4 rounded-md shadow-lg">
        <h3 className="shadow-lg text-center text-xl font-semibold bg-blue-500 text-white py-2 rounded-t-lg">
          Bahan-Bahan:
        </h3>
        <ul className="list-disc ml-8 mt-4 space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 mr-2">
                <BsCheckCircle className="text-white text-xl" />
              </div>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 bg-white bg-gradient-to-br from-white to-gray-300 p-4 rounded-md shadow-lg">
        <h3 className="shadow-lg text-center text-xl font-semibold bg-blue-500 text-white py-2 rounded-t-lg">
          Cara Membuat :
        </h3>
        <ol className="list-decimal ml-8 mt-4 space-y-2">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="flex items-start">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 mr-2">
                <FaUtensils className="text-white text-xl" />
              </div>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col items-center justify-center my-4">
        <p className="text-center">Tekan Bintang Untuk Memberikan Rating</p>
        <div className="px-2 py-2 items-center text-center mt-4">
          <Rating recipeId={id} initialRating={currentRating} onChange={handleRatingChange} />
        </div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <p className="mr-2">Average Rating: </p>
        <div className="p-2 bg-blue-500 rounded-full flex items-center justify-center">
          <BsFillStarFill className="text-yellow-400 inline-block" />
          <span className="text-white text-sm font-bold ml-1">{recipe.rating}</span>
        </div>
      </div>

      <div className="mt-8 text-center font-semibold">
        <h2 className="text-xl text-gray-800">Share Resep ke Sosial Media Anda</h2>
      </div>
      <div className="flex mx-auto m-4 justify-center space-x-1">
        <button
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-300"
          onClick={() => shareOnFacebook(recipe)}
        >
          <FaFacebook className="mr-1 text-sm" />
          Facebook
        </button>
        <button
          className="px-2 py-1 text-sm bg-purple-700 text-white rounded-lg flex items-center hover:bg-purple-800 transition-colors duration-300"
          onClick={() => shareOnInstagram(recipe)}
        >
          <FaInstagram className="mr-1 text-sm" />
          Instagram
        </button>
        <button
          className="px-2 py-1 text-sm bg-green-500 text-white rounded-lg flex items-center hover:bg-green-600 transition-colors duration-300"
          onClick={() => shareOnWhatsApp(recipe)}
        >
          <FaWhatsapp className="mr-1 text-sm" />
          WhatsApp
        </button>
      </div>
      <div className="mt-8">
        <CommentList comments={comments} id={id} comment={comment} setComments={setComments} user={user} />
      </div>
    </div>
  );
};

export default RecipeDetail;
