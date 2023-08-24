import React from "react";

const Favorites = ({ favoriteRecipes }) => {
  return (
    <div>
      <h2>Favorite Recipes</h2>
      <ul>
        {favoriteRecipes.map((recipe) => (
          <li key={recipe.id}>
            <h3>{recipe.title}</h3>
            <img src={recipe.imageURL} alt={recipe.title} />
            <p>{recipe.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
