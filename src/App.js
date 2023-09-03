import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecipeList from "./components/RecipeList";
import Home from "./pages/Home";
import RecipeDetail from "./components/RecipeDetail";
import ForgetPassword from "./pages/ForgetPassword";
import Profile from "./pages/Profile";
import AddRecipeForm from "./components/AddRecipeForm";
import RecipeUser from "./components/RecipeUser";
import ActivityHistory from "./components/ActivityHistory";
import "./styles/tailwind.css";
import { auth, db } from "./services/firebase";
import MessagesList from "./utils/MessagesList";
import MessagesListFloatButton from "./button/MessagesListFloatButton";
import ActivityFloatButton from "./button/ActivityFloatButton";
import EditRecipePage from "./components/EditRecipePage";
import AuthorProfile from "./components/AuthorProfile";
import RecommendationRecipes from "./components/RecommendationRecipes";
import ErrorPage from "./pages/ErrorPage";
import TrandingPage from "./components/TrandingPage";
import OnlineStatus from "./utils/OnlineStatus";

function App() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [userAuth, setUserAuth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = db.collection('data');
        const snapshot = await dataCollection.get();

        const fetchedData = snapshot.docs.map(doc => doc.data());

        localStorage.setItem('cachedData', JSON.stringify(fetchedData));
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setUserAuth(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <HashRouter className="h-screen w-full bg-gradient-to-tr from-primary-500 via-wavy-purple to-accent-400">
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/online" element={<OnlineStatus user={user} />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/activity-history" element={<ActivityHistory />} />
          <Route
            path="/add-recipe"
            element={<AddRecipeForm userAuth={userAuth} />}
          />
          <Route
            path="/recipe-list"
            element={<RecipeList userAuth={userAuth} />}
          />
          <Route path="/tranding" element={<TrandingPage />} />
          <Route path="/user/:authorId" element={<RecipeUser user={user} />} />
          <Route path="/recipes/:id" element={<RecipeDetail user={user} />} />
          <Route
            path="/recomen"
            element={<RecommendationRecipes user={user} />}
          />
          <Route path="/author/:authorId" element={<AuthorProfile />} />
          <Route path="/messages-list" element={<MessagesList />} />
          <Route path="/messages" element={<MessagesListFloatButton />} />
          <Route path="/float" element={<ActivityFloatButton />} />
          <Route
            path="/recipes/edit/:id"
            element={<EditRecipePage user={user} />}
          />
          <Route path="/404" element={<ErrorPage code="404" />} />
          <Route path="/400" element={<ErrorPage code="400" />} />
          <Route path="/401" element={<ErrorPage code="401" />} />
          <Route path="/403" element={<ErrorPage code="403" />} />
          <Route path="/503" element={<ErrorPage code="503" />} />
          <Route path="*" element={<ErrorPage code="404" />} />
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
