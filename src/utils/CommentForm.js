import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const CommentForm = ({ onSubmit, user }) => {
  const [comment, setComment] = useState('');

  const handleChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (comment.trim() !== '') {
      const newComment = {
        content: comment,
      };
      onSubmit(newComment);
      setComment('');
    }
  };

  return (
    <div className="flex flex-col items-start mb-4">
      <div className="w-full px-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mb-2">
            {user && user.imageURL ? (
              <img
                src={user.imageURL}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-8 h-8 text-gray-500" />
            )}

            <span className="ml-2 font-medium">
              {user && user.displayName ? user.displayName : 'Anonymous'}
            </span>
          </div>
          <label htmlFor="commentInput" className="sr-only">
            Add a public comment
          </label>
          <textarea
            id="commentInput"
            value={comment}
            onChange={handleChange}
            placeholder="Add a public comment..."
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '80px' }}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600 transition-colors duration-300 focus:outline-none"
              disabled={!comment.trim()}
            >
              Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;
