import React, { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentAlt,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import MessagesList from "../utils/MessagesList";
import { messagesCollection, auth } from "../services/firebase";
import { Input } from "react-chat-elements";

const MessagesListFloatButton = ({ user, messages }) => {
  const floatButtonRef = useRef(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const countUnreadMessages = () => {
      const unreadCount = messages.filter((message) => !message.read).length;
      setUnreadMessagesCount(unreadCount);

      const storedUnreadCount =
        parseInt(localStorage.getItem("unreadMessagesCount")) || 0;
      setUnreadMessagesCount(storedUnreadCount);
    };

    countUnreadMessages();
    const unsubscribe = messagesCollection.onSnapshot(() =>
      countUnreadMessages()
    );

    setIsMobile(window.innerWidth <= 768);

    return () => unsubscribe();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      try {
        const messageData = {
          senderId: auth.currentUser.uid,
          message: newMessage,
          timestamp: new Date(),
          senderName: user.displayName,
          senderPhoto: user.photoURL,
          read: false,
        };

        await messagesCollection.add(messageData);
        setNewMessage("");

        const updatedUnreadCount =
          parseInt(localStorage.getItem("unreadMessagesCount")) + 1;
        localStorage.setItem("unreadMessagesCount", updatedUnreadCount);
        setUnreadMessagesCount(updatedUnreadCount);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const toggleChat = () => {
    setIsChatOpen((prevIsChatOpen) => {
      if (!prevIsChatOpen) {
        setUnreadMessagesCount(0);
        localStorage.setItem("unreadMessagesCount", 0);
      }
      return !prevIsChatOpen;
    });
  };

  const closeChatBox = () => {
    setIsChatOpen(false);
  };

  const handleDocumentClick = (event) => {
    if (
      isChatOpen &&
      floatButtonRef.current &&
      !floatButtonRef.current.contains(event.target)
    ) {
      const chatBox = document.querySelector(".chat-box");
      if (chatBox && chatBox.contains(event.target)) {
        return;
      }
      closeChatBox();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <>
      {user && (
        <div
          ref={floatButtonRef}
          className={`fixed bottom-4 right-4 bg-primary-500 p-2 rounded-full cursor-pointer chat-button ${
            isMobile ? "md:right-4 md:bottom-4" : ""
          }`}
          onClick={toggleChat}
        >
          <FontAwesomeIcon icon={faCommentAlt} size="lg" color="white" />
          {unreadMessagesCount > 0 && (
            <div className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {unreadMessagesCount}
            </div>
          )}
        </div>
      )}
      {user && isChatOpen && (
        <Draggable handle=".drag-handle" nodeRef={floatButtonRef}>
          <div
            className={`fixed bottom-4 right-4 sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-xl text-primary logo chat-box ${
              isChatOpen ? "block" : "hidden"
            }`}
          >
            <div className="bg-primary-500 text-primary-800 rounded shadow-md">
              <div className="flex justify-between bg-primary-500 text-white p-2 md:p-3 rounded-t-lg drag-handle">
                <h3 className="text-md font-bold">Chat</h3>
                <button
                  className="text-white hover:text-gray focus:outline-none"
                  onClick={closeChatBox}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="h-80 w-80 md:max-w-md lg:max-w-md xl:max-w-xl overflow-y-auto bg-primary-200 dark:bg-gray-800">
                <MessagesList
                  messages={messages}
                  user={user}
                  setIsChatOpen={setIsChatOpen}
                />
              </div>
              <div className="bg-primary-500 p-1">
                <Input
                  className="rounded-md w-full"
                  placeholder="Type a message..."
                  multiline={false}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rightButtons={
                    <button
                      type="submit"
                      className="bg-primary-400 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md"
                      onClick={handleSendMessage}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default MessagesListFloatButton;
