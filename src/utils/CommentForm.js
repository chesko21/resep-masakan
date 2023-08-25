import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { auth } from "../services/firebase";
import { Link } from "react-router-dom";

const CommentForm = ({ onSubmit, user }) => {
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const userAuth = auth.currentUser;
    setIsAnonymous(!userAuth);
  }, []);

  const handleChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (comment.trim() !== "") {
      const newComment = {
        content: comment,
      };
      onSubmit(newComment);
      setComment("");
    }
  };

  return (
    <div className="flex flex-col items-start mb-4">
      {isAnonymous && (
        <div className="text-red-500 mb-4">
          Please&nbsp;
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
          &nbsp;or&nbsp;
          <Link to="/signup" className="text-blue-500">
            SignUp
          </Link>
          &nbsp;to like or comment.
        </div>
      )}
      <div className="w-full px-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mb-2">
            {user && user.imageURL ? (
              <img
                src={user.imageURL}
                alt="User"
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <FaUserCircle className="w-8 h-8 text-gray-500" />
            )}

            <span className="ml-2 font-medium">
              {user && user.displayName ? user.displayName : "Anonymous"}
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
            style={{ minHeight: "80px" }}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600 transition-colors duration-300 focus:outline-none"
              disabled={!comment.trim() || isAnonymous}
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
