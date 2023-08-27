import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import ButtonReply from "../button/ButtonReply";
import ButtonLike from "../button/ButtonLike";
import CommentItem from "../utils/CommentItem";
import CommentForm from "../utils/CommentForm";
import { auth, db, commentsCollection, firebase } from "../services/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faReply } from "@fortawesome/free-solid-svg-icons";

const CommentList = ({ id }) => {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [showReplies, setShowReplies] = useState({});
  const [currentAuthorId, setCurrentAuthorId] = useState(null);

  useEffect(() => {
    const userAuth = auth.currentUser;
    if (userAuth) {
      setUser({
        displayName: userAuth.displayName,
        imageURL: userAuth.photoURL,
      });
      setCurrentAuthorId(userAuth.uid);
    } else {
      setUser(null);
      setCurrentAuthorId(null);
    }

    fetchCommentsDataFromDatabase(id);
  }, [id]);

  const fetchCommentsDataFromDatabase = async (id) => {
    try {
      const snapshot = await db
        .collection("comments")
        .where("recipeId", "==", id)
        .get();
      const commentsData = [];

      for (const doc of snapshot.docs) {
        const commentData = { id: doc.id, ...doc.data() };

        const repliesSnapshot = await doc.ref.collection("replies").get();
        const repliesData = repliesSnapshot.docs.map((replyDoc) => ({
          id: replyDoc.id,
          ...replyDoc.data(),
        }));
        commentData.replies = repliesData;

        commentsData.push(commentData);
      }

      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentSubmit = async (comment) => {
    try {
      const docRef = await commentsCollection.add({
        recipeId: id,
        content: comment.content,
        user: {
          displayName:
            user && user.displayName ? user.displayName : "Anonymous",
          imageURL: user && user.imageURL ? user.imageURL : null,
          photoURL: user && user.photoURL ? user.photoURL : null,
        },
        likes: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Add this line
      });

      // Tambahkan komentar baru ke state comments dengan id yang baru dibuat
      setComments((prevComments) => [
        ...prevComments,
        {
          id: docRef.id,
          recipeId: id,
          content: comment.content,
          user: {
            displayName:
              user && user.displayName ? user.displayName : "Anonymous",
            imageURL: user && user.imageURL ? user.imageURL : null,
            photoURL: user && user.photoURL ? user.photoURL : null,
          },
          likes: 0,
        },
      ]);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleReplyComment = async (parentId, reply) => {
    try {
      if (parentId) {
        // Balasan untuk komentar yang ada
        await commentsCollection
          .doc(parentId)
          .collection("replies")
          .add({
            content: reply.content,
            user: {
              displayName:
                user && user.displayName ? user.displayName : "Anonymous",
              imageURL: user && user.imageURL ? user.imageURL : null,
              photoURL: user && user.photoURL ? user.photoURL : null,
            },
            likes: 0,
          });
      } else {
        console.error("Parent ID is missing for reply.");
      }
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  const handleLikeToggle = async (commentId) => {
    try {
      const commentRef = commentsCollection.doc(commentId);
      const commentDoc = await commentRef.get();

      if (!commentDoc.exists) {
        console.error("Comment does not exist.");
        return;
      }

      const commentData = commentDoc.data();
      const userAuth = auth.currentUser;

      const updatedLikes = [...(commentData.likes || [])];

      const userDisplayName = userAuth ? userAuth.displayName : "Anonymous";

      if (updatedLikes.includes(userDisplayName)) {
        updatedLikes.splice(updatedLikes.indexOf(userDisplayName), 1);
      } else {
        updatedLikes.push(userDisplayName);
      }

      await commentRef.update({ likes: updatedLikes });

      fetchCommentsDataFromDatabase(id);
    } catch (error) {
      console.error("Error handling like toggle:", error);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prevShowReplies) => ({
      ...prevShowReplies,
      [commentId]: !prevShowReplies[commentId],
    }));
  };

  const renderComment = (comment) => {
    let totalLikes = 0;

    if (typeof comment.likes === "number") {
      totalLikes = comment.likes;
    } else if (
      comment.likes &&
      typeof comment.likes === "object" &&
      comment.likes[currentAuthorId]
    ) {
      totalLikes = comment.likes[currentAuthorId].likes;
    }

    if (comment.replies && Array.isArray(comment.replies)) {
      totalLikes += comment.replies.reduce(
        (sum, reply) => sum + reply.likes,
        0
      );
    }

    function formatTimestamp(timestamp) {
      const now = new Date();
      const secondsAgo = Math.floor((now - timestamp) / 1000);

      if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
      } else if (secondsAgo < 3600) {
        const minutesAgo = Math.floor(secondsAgo / 60);
        return `${minutesAgo} minutes ago`;
      } else if (secondsAgo < 86400) {
        const hoursAgo = Math.floor(secondsAgo / 3600);
        return `${hoursAgo} hours ago`;
      } else {
        const daysAgo = Math.floor(secondsAgo / 86400);
        return `${daysAgo} days ago`;
      }
    }

    return (
      <div key={comment.id}>
        <div className="mb-4 item-center">
          <div className="flex items-start">
            {comment.user && comment.user.imageURL ? (
              <img
                src={comment.user.imageURL}
                alt="User"
                className="w-8 h-8 border-2 border-blue-500 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-6 h-6 text-gray-500 border-2 border-blue-500" />
            )}
            <div className="ml-3 flex-grow mb-2 max-h-screen">
              <div className="flex items-center mb-1">
                <strong className="text-sm font-medium">
                  {comment.user && comment.user.displayName
                    ? comment.user.displayName
                    : "Anonymous"}
                </strong>
              </div>
              <div className="text-sm text-gray-700">
                {comment.content}
                <div className="text-sm text-gray-500 mt-2">
                  {comment.timestamp && comment.timestamp.seconds
                    ? formatTimestamp(comment.timestamp.seconds * 1000)
                    : ""}
                </div>
              </div>

              <div className="flex items-center mt-2 text-sm text-gray-500">
                <ButtonLike
                  commentId={comment.id}
                  initialLikes={totalLikes}
                  isLiked={
                    comment.likes &&
                    comment.likes[currentAuthorId] &&
                    comment.likes[currentAuthorId].likedAt
                  }
                  onToggleLike={() => handleLikeToggle(comment.id)}
                />
                <ButtonReply
                  onClick={(replyContent) => {
                    handleReplyComment(comment.id, { content: replyContent });
                    fetchCommentsDataFromDatabase(id);
                  }}
                >
                  <FontAwesomeIcon icon={faReply} />{" "}
                </ButtonReply>
                {comment.replies && comment.replies.length > 0 && (
                  <button
                    className="ml-2 item-center text-center text-blue-500"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {showReplies[comment.id] ? (
                      <FontAwesomeIcon icon={faEyeSlash} />
                    ) : (
                      <FontAwesomeIcon icon={faEye} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Render balasan */}
        {showReplies[comment.id] &&
          comment.replies &&
          comment.replies.length > 0 && (
            <div className="pl-8 mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReplyComment={(replyContent) =>
                    handleReplyComment(comment.id, { content: replyContent })
                  }
                  onToggleLike={fetchCommentsDataFromDatabase}
                />
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="mt-6 justify-center item-center">
      <h3 className="text-lg font-medium mb-4">Comments</h3>
      <div className="mb-4">
        <CommentForm onSubmit={handleCommentSubmit} user={user} />
      </div>
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <div>
            {comments.map((comment) => (
              <React.Fragment key={comment.id}>
                {renderComment(comment)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 text-center underline text-italic">
        <p>Note: Silahkan Reload Page jika Comment Anda Tidak Tampil</p>
      </div>
    </div>
  );
};

export default CommentList;
