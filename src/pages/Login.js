import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleAuthProvider, createUserProfileDocument } from '../services/firebase';
import 'animate.css';
import defaultProfileImage from '../assets/profile.svg';
import BeatLoader from "react-spinners/BeatLoader";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      await auth.signInWithEmailAndPassword(email, password);
      const currentUser = auth.currentUser;
      const imageURL = currentUser.photoURL || defaultProfileImage;

      await createUserProfileDocument(currentUser, { photoURL: imageURL });

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/");
      }, 3000);
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setError("Password Salah!! Coba Login dengan Akun Google");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { user } = await auth.signInWithPopup(googleAuthProvider);
      const imageURL = user.photoURL || defaultProfileImage;

      await createUserProfileDocument(user, { photoURL: imageURL });

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/");
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      setError(null);

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center text-center bg-wavy-purple min-h-screen">
      <h2 className="text-3xl font-bold mb-6 animate__animated animate__fadeIn">
        Login
      </h2>
      <p className="mb-2 font-bold underline"> Resep Masakan Indonesia </p>
      {error && (
        <p className="text-red-500 mb-4 animate__animated animate__shakeX">
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} className="flex flex-col items-center">
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
          <label htmlFor="password" className="flex mr-2 mb-2 font-semibold">
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
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md animate__animated ${isLoading ? "opacity-75 cursor-not-allowed" : "animate__fadeIn"
            }`}
          disabled={isLoading}
        >
          {isLoading ? <BeatLoader color="white" size={8} /> : "Login"}
        </button>
      </form>
      <p className="mt-4 animate__animated animate__fadeIn">
        Not registered?{" "}
        <Link to="/signup" className="text-blue-500">
          Signup
        </Link>
      </p>
      <button
        className="flex mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md animate__animated animate__fadeIn"
        onClick={handleLoginWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Login with Google"}
      </button>
      <button
        className="flex mt-2 text-blue-500 hover:underline animate__animated animate__fadeIn"
        onClick={handleForgotPassword}
      >
        <Link to="/forget-password">Forgot Password?</Link>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-accent-400 p-4 rounded-lg shadow-lg animate__animated animate__fadeIn">
            <p className="text-green-500 text-lg font-semibold mb-2">
              Login Successful!
            </p>
            <p>You will be redirected to the home page.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
