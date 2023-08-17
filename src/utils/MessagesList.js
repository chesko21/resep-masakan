import React, { useEffect, useRef, forwardRef } from 'react';
import { auth } from '../services/firebase';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

const ForwardedMessageBox = forwardRef((props, ref) => (
  <MessageBox {...props} forwardedRef={ref} />
));

const MessagesList = ({ messages, user, setIsChatOpen }) => {
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="p-2 h-60 overflow-y-auto">
      {messages.map((message) => (
        <ForwardedMessageBox
          key={message.id}
          position={message.senderId === auth.currentUser.uid ? 'right' : 'left'}
          type="text"
          text={message.message}
          date={message.timestamp ? message.timestamp.toDate() : null}
          title={message.senderId === auth.currentUser.uid ? 'You' : message.senderName}
          titleColor={message.senderId === auth.currentUser.uid ? 'blue' : 'black'}
          avatar={message.senderPhoto} // Using the sender's profile photo URL
          avatarFlex={message.senderId === auth.currentUser.uid ? 'right' : 'left'}
          forwardedRef={messages[messages.length - 1] === message ? chatBoxRef : null}
          avatarSize={40}
        />
      ))}
    </div>
  );
};

export default MessagesList;
