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

  const removeHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const plainText = removeHtmlTags(text);

   return (
    <Link to={`/author/${senderId}`}>
      <div key={messages.id}>
        <MessageBox
          className={`p-1 text-start font-body bg-blue-400 ${
            isCurrentUser ? "text-right" : "text-left"
          }`}
          position={position}
          type="text"
          text={plainText}
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

        <div className="text-start" ref={chatBoxRef}></div>
      </div>
    </Link>
  );
};

const MessagesList = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <ForwardedMessageBox
          className="text-start "
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
