import React, { useState, useEffect } from "react";
import ButtonLike from "../button/ButtonLike";
import { auth, commentsCollection, db } from "../services/firebase";
import defaultProfileImage from "../assets/profile.svg";

const CommentItem = (props) => {
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const DEFAULT_PROFILE_IMAGE = defaultProfileImage;
  const currentLikeCount = likesCount;

    const [replyLikesCount, setReplyLikesCount] = useState(
      Array.isArray(props.comment.likes) ? props.comment.likes.length : 0
    );
    const [replyIsLiked, setReplyIsLiked] = useState(isLiked);

  useEffect(() => {
    const userAuth = auth.currentUser;
    if (userAuth) {
      setUser({
        displayName: userAuth.displayName,
        imageURL: userAuth.photoURL,
      });
    } else {
      setUser(null);
    }
  }, []);


  useEffect(() => {
    if (user && Array.isArray(props.comment.likes)) {
      setIsLiked(props.comment.likes.includes(user.uid));
    } else {
      setIsLiked(false);
    }

    setLikesCount(
      Array.isArray(props.comment.likes) ? props.comment.likes.length : 0
    );
  }, [props.comment.likes, user]);


  const handleLikeReply = async () => {
      if (!user) {
        alert("You need to be logged in to like replies.");
        return;
      }

      try {
        const updatedLikes = replyIsLiked
          ? props.comment.likes.filter((like) => like !== user.displayName)
          : [...props.comment.likes, user.displayName];

        await commentsCollection
          .doc(props.comment.id)
          .update({ likes: updatedLikes });

        setReplyIsLiked(!replyIsLiked);
        setReplyLikesCount(updatedLikes.length);

        if (props.onToggleLike) {
          props.onToggleLike();
        }
      } catch (error) {
        console.error("Error handling like reply:", error);
      }
    };


  const handleLikeClick = async () => {
    if (!user) {
      alert("You need to be logged in to like.");
      return;
    }

    const likesRef = db
      .collection("comments")
      .doc(props.comment.id)
      .collection("likes")
      .doc(user.uid);

    const existingLike = await likesRef.get();

    if (existingLike.exists) {
      await existingLike.ref.delete();
      setIsLiked(false);
      setLikesCount((prevCount) => prevCount - 1);
    } else {
      await likesRef.set({ likedAt: new Date() });
      setIsLiked(true);
      setLikesCount((prevCount) => prevCount + 1);
    }
  };


  return (
    <div className="comment-item ml-4">
      <div className="flex items-start">
        {props.comment.user && props.comment.user.imageURL ? (
          <img
            src={props.comment.user.imageURL}
            alt="User"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <img
            src={
              props.comment.user && props.comment.user.imageURL
                ? props.comment.user.imageURL
                : props.userPhotoURL || DEFAULT_PROFILE_IMAGE
            }
            alt="User"
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
        <div className="ml-3 flex-grow mb-4">
          <div className="flex items-center mb-1">
            <strong className="text-sm font-medium">
              {props.comment.user && props.comment.user.displayName
                ? props.comment.user.displayName
                : "Anonymous"}
            </strong>
          </div>
          <div className="text-sm text-gray-700">{props.comment.content}</div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <ButtonLike
              commentId={props.comment.id}
              initialLikes={
                Array.isArray(props.comment.likes)
                  ? props.comment.likes.length
                  : 0
              }
              isLiked={isLiked}
              onToggleLike={handleLikeReply}
            />
          </div>
          {props.comment.replies && props.comment.replies.length > 0 && (
      <div className="pl-8 mt-4">
        {props.comment.replies.map((reply) => {
          const replyLikes = Array.isArray(reply.likes) ? reply.likes : [];
          return (
            <div key={reply.id} className="flex items-start">
               {reply.user && reply.user.imageURL ? (
                      <img
                        src={reply.user.imageURL}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <img
                        src={props.userPhotoURL || DEFAULT_PROFILE_IMAGE}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}

                    <div className="ml-3 flex-grow">
                      <div className="flex items-center mb-1">
                        <strong className="text-sm font-medium">
                          {reply.user && reply.user.displayName
                            ? reply.user.displayName
                            : "Anonymous"}
                        </strong>
                      </div>
                      <div className="text-sm text-gray-700">
                        {reply.content}
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                      <ButtonLike
                                     commentId={reply.id}
                                     initialLikes={replyLikesCount}
                                     isLiked={replyIsLiked}
                                     onToggleLike={handleLikeReply}
                                   />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
