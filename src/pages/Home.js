import React, { useState, useEffect, useRef } from "react";
import RecommendationRecipes from "../components/RecommendationRecipes";
import RecipeList from "../components/RecipeList";
import {
  auth,
  usersCollection,
  recipesCollection,
  messagesCollection,
} from "../services/firebase";
import MessagesListFloatButton from "../button/MessagesListFloatButton";
import BeatLoader from "react-spinners/BeatLoader";
import TrandingPage from "../components/TrandingPage";

const Home = ({ profilePhoto, authorId, isChatOpen, userAuth }) => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const unsubscribe = messagesCollection
      .orderBy("timestamp")
      .limit(50)
      .onSnapshot((snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const fetchUser = async () => {
          try {
            const userRef = usersCollection.doc(currentUser.uid);
            const snapshot = await userRef.get();
            if (snapshot.exists) {
              const userData = snapshot.data();
              const updatedActivity =
                userData.activity && userData.activity.slice(-5);
              setUser({
                ...userData,
                activity: updatedActivity,
                photoURL: userData.photoURL,
              });
            } else {
              console.log("User data does not exist.");
            }
          } catch (error) {
            console.error("Error fetching user data", error);
          }
        };

        fetchUser();
      } else {
        console.log("Current user not found.");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = messagesCollection
      .orderBy("timestamp")
      .onSnapshot((snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await recipesCollection.get();
      const recipesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);
    };

    fetchRecipes();
  }, [setRecipes]);

  useEffect(() => {
    if (isChatOpen && chatBoxRef.current) {
      chatBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-tr from-primary-500 via-wavy-purple to-accent-400">
        <div className="flex items-center justify-center min-h-screen">
          <BeatLoader /> LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between text-center
     bg-gradient-to-tr from-primary-500 via-wavy-purple to-accent-400 font-logo">
      <div>
        <div className="m-4 text-yellow-500">
          <span className="border-b-2 border-t-2 border-white">
            {currentTime.split(":")[0]}
          </span>
          <span className="mx-2">:</span>
          <span className="border-b-2 border-t-2 border-white">
            {currentTime.split(":")[1]}
          </span>
          <span className="mx-2">:</span>
          <span className="border-b-2 border-t-2 border-white">
            {currentTime.split(":")[2]}
          </span>
        </div>
        <div className="text-2xl m-4 text-white animate__animated animate__fadeIn">
          Selamat Datang di Resep Masakan Indonesia!
        </div>
        <p className="m-4 text-center">
          Temukan berbagai resep masakan yang lezat dan nikmati pengalaman
          memasak yang menyenangkan.
        </p>
        <p className="m-4 text-center">
          Daftar Sekarang Juga , Anda Bisa Membuat Resep Favorite Anda Sendiri.
        </p>
        <div className="mb-4">
          <RecipeList userAuth={userAuth} />
        </div>
        <div>
          <TrandingPage />
        </div>
        <div>
        <RecommendationRecipes setUserRecipes={setRecipes} />
      </div>
        </div>
      <MessagesListFloatButton user={user} messages={messages} />
    </div>
  );
};

export default Home;
