import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { db, auth } from '../services/firebase';

const Rating = ({ recipeId, initialRating, onChange }) => {
  const [rating, setRating] = useState(parseFloat(initialRating));
  const [isRated, setIsRated] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [isStarOn, setIsStarOn] = useState(false);

  useEffect(() => {
    setRating(parseFloat(initialRating));
  }, [initialRating]);

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const userAuth = auth.currentUser;
        if (userAuth) {
          const userId = userAuth.uid;
          const ratingDocRef = db.collection('recipes').doc(recipeId).collection('ratings').doc(userId);
          const ratingDoc = await ratingDocRef.get();

          if (ratingDoc.exists) {
            const userRating = ratingDoc.data().rating;
            setCurrentRating(userRating);
            setIsRated(true);
            setIsStarOn(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [recipeId]);

  const handleRatingChange = async (value) => {
    const ratingValue = parseFloat(value);

    if (!isRated) {
      setRating(ratingValue);
      setCurrentRating(ratingValue);
      setIsRated(true);
      setIsStarOn(true);
      onChange(ratingValue);

      try {
        const userAuth = auth.currentUser;
        if (userAuth) {
          const userId = userAuth.uid;
          const ratingDocRef = db.collection('recipes').doc(recipeId).collection('ratings').doc(userId);
          await ratingDocRef.set({ rating: ratingValue });

          const recipeDocRef = db.collection('recipes').doc(recipeId);
          const recipeDoc = await recipeDocRef.get();
          if (recipeDoc.exists) {
            const recipeData = recipeDoc.data();
            const comments = recipeData.comments || [];
            comments.push({ userId, rating: ratingValue });
            const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
            const average = totalRating / comments.length;
            await recipeDocRef.update({ rating: average.toFixed(1), comments });
          }
        }
      } catch (error) {
        console.error('Error updating user rating:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isFilledStar = starValue <= rating;
          const isHalfStar = starValue === Math.ceil(rating) && rating % 1 !== 0;
          const starColor = isRated ? 'text-yellow-500' : 'text-gray-400';
          return (
            <span
              key={index}
              className={`text-3xl cursor-pointer ${isFilledStar || isStarOn ? starColor : isHalfStar ? starColor : 'text-gray-400'}`}
              onClick={() => handleRatingChange(starValue)}
            >
              {isFilledStar ? <FaStar className={isRated ? 'text-yellow-500' : 'text-gray-400'} /> : isHalfStar ? <FaStarHalfAlt className={isRated ? 'text-yellow-500' : 'text-gray-400'} /> : <FaStar className=" text-gray-300 " />}
            </span>
          );
        })}
        <span className="ml-2">{isRated ? currentRating.toFixed(1) : rating.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default Rating;
