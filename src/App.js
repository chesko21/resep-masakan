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
import { auth } from "./services/firebase";
import MessagesList from "./utils/MessagesList";
import MessagesListFloatButton from "./button/MessagesListFloatButton";
import ActivityFloatButton from "./button/ActivityFloatButton";
import EditRecipePage from "./components/EditRecipePage";
import AuthorProfile from "./components/AuthorProfile";
import RecommendationRecipes from "./components/RecommendationRecipes";

const App = () => {
  const [user, setUser] = useState(null);
  const [userAuth, setUserAuth] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setUserAuth(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <HashRouter className="h-screen w-full">
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
