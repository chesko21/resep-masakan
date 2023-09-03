import React, { useEffect, useState } from "react";
import { db, firebase } from "../services/firebase";
import "font-awesome/css/font-awesome.min.css";
import "animate.css/animate.min.css";

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const auth = firebase.auth();
    const user = auth.currentUser;

    if (user) {
      const userStatusRef = db.collection("onlineStatus").doc(user.uid);
      userStatusRef.set({ online: true });

      return () => {
        userStatusRef.set({ online: false });
      };
    }
  }, []);

  useEffect(() => {
    const auth = firebase.auth();
    const user = auth.currentUser;

    if (user) {
      const userStatusRef = db.collection("onlineStatus").doc(user.uid);

      userStatusRef.onSnapshot((snapshot) => {
        const data = snapshot.data();
        setIsOnline(data.online === true);
      });

      db.collection("onlineStatus")
        .where("online", "==", true)
        .onSnapshot((snapshot) => {
          const onlineUsersCount = snapshot.docs.length;
          setOnlineUsersCount(onlineUsersCount);
        });
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsBlinking((prevBlinking) => !prevBlinking);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="mt-4 font-logo mb-4 ">
      {isOnline ? (
        <span className={`text-success ${isBlinking ? "animate__flash" : ""}`}>
          <i className={`fa fa-circle text-yellow-500 ${isBlinking ? "animate__flash" : ""}`}></i> Online
        </span>
      ) : (
        <span className={`text-danger ${isBlinking ? "animate__flash" : ""}`}>
          <i className={`fa fa-circle ${isBlinking ? "animate__flash" : ""}`}></i> Offline
        </span>
      )}
      <div className="mt-2">User Online: {onlineUsersCount}</div>
    </div>
  );
};

export default OnlineStatus;
