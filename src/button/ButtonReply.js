import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";

const ButtonReply = ({ onClick, commentId }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    // Fetch the replies for the given commentId from Firebase
    const fetchReplies = async () => {
      try {
        const repliesSnapshot = await db
          .collection("comments")
          .doc(commentId)
          .collection("replies")
          .orderBy("createdAt", "asc")
          .get();

        const fetchedReplies = repliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    };

    fetchReplies();
  }, [commentId]);

  const handleReplySubmit = async () => {
    if (replyContent.trim() !== "") {
      onClick(replyContent, commentId);
      setIsReplying(false);
      setReplyContent("");

      try {
        const repliesSnapshot = await db
          .collection("comments")
          .doc(commentId)
          .collection("replies")
          .orderBy("createdAt", "asc")
          .get();

        const fetchedReplies = repliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    }
  };

  const handleReplyClick = () => {
    setIsReplying(true);
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyContent("");
  };

  return (
    <div>
      {isReplying ? (
        <div className="flex items-center border-t border-gray-300 mt-4 pt-4">
          <textarea
            className="flex-grow border border-gray-300 rounded p-2 resize-none"
            placeholder="Reply to this comment..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex items-center ml-4">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={handleReplySubmit}
            >
              Reply
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 ml-2"
              onClick={handleCancelReply}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            className="text-blue-500 hover:text-blue-700 ml-4"
            onClick={handleReplyClick}
          >
            Reply
          </button>
          {replies && replies.length > 0 && (
            <ul className="pl-8 mt-4 mb-6">
              {replies.map((reply) => (
                <li key={reply.id} className="border-t border-gray-300 py-2">
                  {reply.content}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonReply;
