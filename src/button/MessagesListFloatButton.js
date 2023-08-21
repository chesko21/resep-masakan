import React, { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import MessagesList from '../utils/MessagesList';
import { messagesCollection, auth } from '../services/firebase';
import { Input } from 'react-chat-elements';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const MessagesListFloatButton = ({ user, messages }) => {
  const floatButtonRef = useRef(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const countUnreadMessages = () => {
      const unreadCount = messages.filter((message) => !message.read).length;
      setUnreadMessagesCount(unreadCount);

      const storedUnreadCount = parseInt(localStorage.getItem('unreadMessagesCount')) || 0;
      setUnreadMessagesCount(storedUnreadCount);
    };

    countUnreadMessages();
    const unsubscribe = messagesCollection.onSnapshot(() => countUnreadMessages());

    setIsMobile(window.innerWidth <= 768);

    return () => unsubscribe();
  }, [messages]);


  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
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
        setNewMessage('');

        const updatedUnreadCount = parseInt(localStorage.getItem('unreadMessagesCount')) + 1;
        localStorage.setItem('unreadMessagesCount', updatedUnreadCount);
        setUnreadMessagesCount(updatedUnreadCount);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };


  const toggleChat = () => {
    setIsChatOpen((prevIsChatOpen) => {
      if (!prevIsChatOpen) {

        setUnreadMessagesCount(0);
        // Save unread messages count in localStorage
        localStorage.setItem('unreadMessagesCount', 0);
      }
      return !prevIsChatOpen;
    });
  };

  const closeChatBox = () => {
    setIsChatOpen(false);
  };

  const handleDocumentClick = (event) => {
    if (isChatOpen && floatButtonRef.current && !floatButtonRef.current.contains(event.target)) {
      const chatBox = document.querySelector('.chat-box');
      if (chatBox && chatBox.contains(event.target)) {
        return;
      }
      closeChatBox();
    }
  };


  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isChatOpen]);
  return (
    <>
      {user && (
        <div
          ref={floatButtonRef}
          className="fixed bottom-12 right-8 bg-primary-700 p-3 rounded-full cursor-pointer chat-button"
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
            className="fixed bottom-4 right-4 md:w-72 lg:w-96 text-primary logo chat-box"
          >
            <div className="bg-primary-700 text-primary-900 rounded-lg shadow-md">
              <div className="flex items-center justify-between bg-primary-500 text-white p-4 rounded-t-lg drag-handle">
                <h3 className="text-md font-bold">Chat</h3>
                <button className="text-white hover:text-gray focus:outline-none" onClick={closeChatBox}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div id="chat-container" className="h-60 overflow-y-auto bg-primary-200 md-dark">
                <MessagesList messages={messages} user={user} setIsChatOpen={setIsChatOpen} />
              </div>
              <div className="p-2">
                <Input
                  className="rounded-md bg-primary-100"
                  placeholder="Type a message..."
                  multiline={false}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rightButtons={
                    <button
                      type="submit"
                      className="bg-primary-500 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md"
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
