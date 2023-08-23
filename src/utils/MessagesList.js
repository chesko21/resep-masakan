import React, { useEffect, useRef } from "react";
import { auth } from "../services/firebase";
import { MessageBox } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { Link } from "react-router-dom";

const ForwardedMessageBox = (props) => {
  const {
    position,
    text,
    timestamp,
    senderId,
    senderName,
    senderPhoto,
    messages,
  } = props;

  const chatBoxRef = useRef(null);

  const isCurrentUser = senderId === auth.currentUser.uid;
  const messageStyle = {
    backgroundColor: isCurrentUser ? "blue" : "orange",
    color: "white",
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div key={messages.id}>
      <MessageBox className="p-1"
        position={position}
        type="text"
        text={text}
        date={timestamp ? timestamp.toDate() : null}
        title={
          <Link
            to={`/author/${senderId}`}
            className={
              isCurrentUser
                ? ""
                : "font-bold text-black bg-primary-500 rounded m-1 p-1"
            }
          >
            <span
              className={`${
                isCurrentUser
                  ? "font-bold text-black bg-blue-500 rounded m-1 p-1"
                  : ""
              }`}
            >
              {isCurrentUser ? "You" : senderName }
            </span>
          </Link>
        }
        titleColor={isCurrentUser ? "blue" : "orange"}
        avatar={senderPhoto}
        avatarFlex={isCurrentUser ? "right" : "left"}
        forwardedRef={
          messages[messages.length - 1] === messages ? chatBoxRef : null
        }
        avatarSize={30}
        style={{
          maxWidth: "60",
        }}
        customStyle={messageStyle}
      />
      <div className="" ref={chatBoxRef}></div>
    </div>
  );
};

const MessagesList = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <ForwardedMessageBox
          key={message.id}
          position={
            message.senderId === auth.currentUser.uid ? "right" : "left"
          }
          text={message.message}
          timestamp={message.timestamp}
          senderId={message.senderId}
          senderName={message.senderName}
          senderPhoto={message.senderPhoto}
          messages ={messages}
        />
      ))}
    </div>
  );
};

export default MessagesList;
