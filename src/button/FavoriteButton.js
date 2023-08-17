import React, { useState } from 'react';
import { usersCollection } from '../services/firebase';

const FavoriteButton = ({ recipe, authorId }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = async () => {
    try {
      const userRef = usersCollection.doc(authorId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        const favorites = userData.favorites || [];

        if (isFavorite) {
          // Hapus resep dari daftar favorit
          const updatedFavorites = favorites.filter((favorite) => favorite.id !== recipe.id);
          await userRef.update({ favorites: updatedFavorites });
          setIsFavorite(false);
        } else {
          // Tambahkan resep ke daftar favorit
          const updatedFavorites = [...favorites, recipe];
          await userRef.update({ favorites: updatedFavorites });
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <button onClick={handleFavoriteClick}>
      {isFavorite ? 'Hapus dari Favorit' : 'Tambahkan ke Favorit'}
    </button>
  );
};

export default FavoriteButton;
