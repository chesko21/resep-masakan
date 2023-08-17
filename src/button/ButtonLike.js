import React, { useState, useEffect } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { db } from '../services/firebase';

const ButtonLike = ({ commentId, initialLikes }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  useEffect(() => {
    const likesRef = db.collection('comments').doc(commentId).collection('likes');

    // Get the current user ID (Replace 'CURRENT_USER_ID' with the actual code to get the user ID)
    const currentAuthorId = 'AuthorId'; // Ganti 'AuthorId' dengan kode yang benar untuk mendapatkan ID pengguna saat ini.

    // Check if the current user has liked the comment
    likesRef
      .doc(currentAuthorId)
      .get()
      .then((doc) => {
        setIsLiked(doc.exists);
      })
      .catch((error) => {
        console.error('Error checking like status:', error);
      });

    // Set up the real-time listener for the likes collection
    const unsubscribe = likesRef.onSnapshot((snapshot) => {
      setLikeCount(snapshot.size);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [commentId]);

  const handleLikeClick = async () => {
    try {
      const likesRef = db.collection('comments').doc(commentId).collection('likes');

      // Get the current user ID (Replace 'CURRENT_USER_ID' with the actual code to get the user ID)
      const currentAuthorId = 'currentAuthorId';

      if (isLiked) {
        // If the comment is already liked by the current user, remove the like
        await likesRef.doc(currentAuthorId).delete();
      } else {
        // If the comment is not liked by the current user, add the like
        await likesRef.doc(currentAuthorId).set({ likedAt: new Date() });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  return (
    <button
      className={`flex items-center ${
        isLiked ? 'text-blue-500' : 'text-gray-500'
      } hover:text-blue-500 transition-colors`}
      onClick={handleLikeClick}
    >
      <FaThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'}`} />
      <span>{likeCount}</span>
    </button>
  );
};

export default ButtonLike;
