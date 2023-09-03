import React, { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { IoHeartOutline, IoHeart } from "react-icons/io5";

const FavoriteButton = ({ recipeId }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = db.collection("users").doc(user.uid);
          const userSnapshot = await userRef.get();

          if (userSnapshot.exists) {
            const userData = userSnapshot.data();
            const favorites = userData.favorites || [];
            setIsFavorite(favorites.includes(recipeId));
          }
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [recipeId]);

  const handleFavoriteToggle = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = db.collection("users").doc(user.uid);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          const favorites = userData.favorites || [];

          if (favorites.includes(recipeId)) {
            const updatedFavorites = favorites.filter((id) => id !== recipeId);
            await userRef.update({ favorites: updatedFavorites });
            setIsFavorite(false);
          } else {
            await userRef.update({ favorites: [...favorites, recipeId] });
            setIsFavorite(true);
          }
        }
      }
    } catch (error) {
      console.error("Error adding/removing from favorites:", error);
    }
  };

  return (
    <div className="flex flex-col items-end text-center justify-center">
      <button
        className={`rounded p-2 text-gray-500 hover:text-red-500 transition ${isFavorite ? "hidden" : "block"
          }`}
        onClick={handleFavoriteToggle}
      >
        <IoHeartOutline size={30} />
      </button>
      <button
        className={`rounded p-2 text-red-500 hover:text-gray-500 transition ${isFavorite ? "block" : "hidden"
          }`}
        onClick={handleFavoriteToggle}
      >
        <IoHeart size={30} />
      </button>
      <span className="text-xs font-logo">
        {isFavorite ? "Remove Favorites" : "Add Favorites"}
      </span>
    </div>
  );
};

export default FavoriteButton;
