import React, { useState, useEffect } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { db } from '../services/firebase';

const ButtonLike = ({ commentId }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const likesRef = db.collection('comments').doc(commentId).collection('likes');
    const currentAuthorId = 'CURRENT_USER_ID'; // Replace with actual user ID retrieval logic

    likesRef.doc(currentAuthorId).get()
      .then((doc) => {
        setIsLiked(doc.exists);
      })
      .catch((error) => {
        console.error('Error checking like status:', error);
      });

    const unsubscribe = likesRef.onSnapshot((snapshot) => {
      setLikeCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [commentId]);

  const handleLikeClick = async () => {
    try {
      const likesRef = db.collection('comments').doc(commentId).collection('likes');
      const currentAuthorId = 'CURRENT_USER_ID'; // Replace with actual user ID

      if (isLiked) {
        await likesRef.doc(currentAuthorId).delete();
      } else {
        await likesRef.doc(currentAuthorId).set({ likedAt: new Date() });
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  return (
    <button
      className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500 transition-colors`}
      onClick={handleLikeClick}
    >
      <FaThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'}`} />
      <span>{likeCount}</span>
    </button>
  );
};

export default ButtonLike;
