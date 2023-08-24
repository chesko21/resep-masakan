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

  const truncatedSenderName = senderName.slice(0, 20); 
  const chatBoxRef = useRef(null);
  const truncatedText = text.slice(0, 100);
  const isCurrentUser = senderId === auth.currentUser.uid;
  const messageStyle = {
    backgroundColor: isCurrentUser ? "blue" : "orange",
    color: isCurrentUser ? "white" : "black",
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Link to={`/author/${senderId}`}>
      <div key={messages.id}>
        <MessageBox
          className={`p-1 text-start ${
            isCurrentUser ? "text-right" : "text-left"
          }`}
          position={position}
          type="text"
          text={truncatedText}
          date={timestamp ? timestamp.toDate() : null}
          title={truncatedSenderName}
          avatar={senderPhoto}
          titleColor={isCurrentUser ? "blue" : "red"}
          forwardedRef={
            messages[messages.length - 1] === messages ? chatBoxRef : null
          }
          style={{
            maxWidth: "80%",
            width: text.length < 20 ? `${text.length * 10}px` : "auto",
            color: isCurrentUser ? "white" : "black",
            textAlign: isCurrentUser ? "right" : "left",
            ...messageStyle,
            wordWrap: "break-word",
          }}
          customStyle={messageStyle}
        />

        <div className="text-start bg-secondary-500" ref={chatBoxRef}></div>
      </div>
    </Link>
  );
};


const MessagesList = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <ForwardedMessageBox
          className="bg-secondary-500 text-start"
          key={message.id}
          position={
            message.senderId === auth.currentUser.uid ? "right" : "left"
          }
          text={message.message}
          timestamp={message.timestamp}
          senderId={message.senderId}
          senderName={message.senderName}
          senderPhoto={message.senderPhoto}
          messages={messages}
        />
      ))}
    </div>
  );
};

export default MessagesList;
