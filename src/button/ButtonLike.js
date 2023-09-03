import React, { useState, useEffect } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { db, auth } from "../services/firebase";

const ButtonLike = ({ commentId, user }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    const commentRef = db.collection("comments").doc(commentId);
    const likesRef = commentRef.collection("likes");

    // Fetch like count
    likesRef.get().then((snapshot) => {
      setLikeCount(snapshot.size);
    });

    // Check if the user has liked
    if (auth.currentUser) {
      likesRef
        .doc(auth.currentUser.uid)
        .get()
        .then((doc) => {
          setUserLiked(doc.exists);
        });
    }
  }, [commentId]);

  const handleLikeClick = async () => {
    if (!auth.currentUser) {

      return;
    }

    const userAuth = auth.currentUser;
    const commentRef = db.collection("comments").doc(commentId);
    const likesRef = commentRef.collection("likes").doc(userAuth.uid);

    if (userLiked) {
      await likesRef.delete();
      setLikeCount((prevCount) => prevCount - 1);
    } else {
      await likesRef.set({ likedAt: new Date() });
      setLikeCount((prevCount) => prevCount + 1);
    }

    setUserLiked(!userLiked);
  };

  return (
    <button
      className={`flex items-center ${userLiked ? "text-blue-500" : "text-gray-500"
        } hover:text-blue-500 transition-colors`}
      onClick={handleLikeClick}
      disabled={!auth.currentUser}
    >
      <FaThumbsUp
        className={`w-4 h-4 mr-1 ${userLiked ? "text-blue-500" : "text-gray-500"
          }`}
      />
      <span>{likeCount}</span>
    </button>
  );
};

export default ButtonLike;
