import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  auth,
  createUserProfileDocument,
  googleAuthProvider,
} from "../services/firebase";
import "animate.css";
import defaultProfileImage from "../assets/profile.svg";
import BeatLoader from "react-spinners/BeatLoader";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      const googleUser = await auth.signInWithPopup(googleAuthProvider);
      const googleEmail = googleUser.user.email;
      

      setEmail(googleEmail);

      const defaultPassword = "google-password";

      const { user } = await auth.createUserWithEmailAndPassword(
        googleEmail,
        defaultPassword
      );
      const imageURL = defaultProfileImage;

      await createUserProfileDocument(user, {
        displayName: displayName,
        photoURL: imageURL,
      });

      await user.sendEmailVerification();

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/");
      }, 3000);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Silahkan Login.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

const handleSignup = async (event) => {
  event.preventDefault();

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (!displayName || !email || !password || !confirmPassword) {
    setError("Please fill in all the fields");
    return;
  }

  try {
    setIsLoading(true);

    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    const imageURL = defaultProfileImage;

    await createUserProfileDocument(user, {
      displayName: displayName, 
      photoURL: imageURL,
    });

    await auth.signInWithEmailAndPassword(email, password);
    await user.sendEmailVerification();
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      navigate("/");
    }, 3000);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      setError("Email Sudah Terdaftar, Silahkan Login.");
    } else {
      setError(error.message);
    }
  } finally {
    setIsLoading(false);
  }
};

  
  return (
    <div className="flex flex-col items-center bg-wavy-purple min-h-screen ">
      <h2 className="text-3xl font-bold mb-6 animate__animated animate__fadeIn">
        Signup
      </h2>
      <p className="mb-2 font-bold underline"> Resep Masakan Indonesia </p>
      {error && (
        <p className="text-red-500 mb-4 animate__animated animate__shakeX">
          {error}
        </p>
      )}
      <form onSubmit={handleSignup} className="flex flex-col items-center">
        <div className="mb-4">
          <label htmlFor="displayName" className="flex mr-2 mb-2 font-semibold">
            Name:
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={handleDisplayNameChange}
            className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="flex mr-2 mb-2 font-semibold">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mr-2 mb-2 font-semibold">
            Password:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="mr-2 mb-2 font-semibold">
            Confirm Password:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md animate__animated ${isLoading ? "opacity-75 cursor-not-allowed" : "animate__fadeIn"
            }`}
          disabled={isLoading}
        >
          {isLoading ? <BeatLoader color="white" size={8} /> : "Signup"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md mt-4 animate__animated animate__fadeIn"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Signup with Google"}
      </button>

      <p className="mt-4 animate__animated animate__fadeIn">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500">
          Login
        </Link>
      </p>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-purple-700 p-4 rounded-lg shadow-lg animate__animated animate__fadeIn">
            <p className="text-green-500 text-lg font-semibold mb-2">
              Registration Successful!
            </p>
            <p>You will be redirected to the home page.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
