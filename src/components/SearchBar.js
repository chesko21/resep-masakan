import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="text-center items-center mt-2">
      <input
        type="text"
        placeholder="Cari resep..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border border-black-500 rounded-l-full focus:outline-none"
      />
      <button
        onClick={handleSearch}
        className="bg-amber-500  border-white ml-2 text-white px-4 py-2 rounded-r-full hover:bg-blue-600 focus:outline-none"
      >
        Cari
      </button>
    </div>
  );
};

export default SearchBar;
