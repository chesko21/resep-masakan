import React, { useState } from 'react';
import { auth } from '../services/firebase';
import 'animate.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true); 
      setError(null);
      await auth.sendPasswordResetEmail(email);
      setIsEmailSent(true); 
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl font-bold mb-6 animate__animated animate__fadeIn">Forgot Password</h2>
      {isEmailSent ? (
        <div className="text-center">
          <p className="text-green-500 mb-4 animate__animated animate__fadeIn">
            Please check your email to reset your password.
          </p>
          <p className="text-gray-600 animate__animated animate__fadeIn">
            If you don't receive an email, please check your spam folder or try again later.
          </p>
        </div>
      ) : (
        <>
          {error && <p className="text-red-500 mb-4 animate__animated animate__shakeX">{error}</p>}
          <form onSubmit={handleResetPassword} className="flex flex-col items-center">
            <div className="mb-4">
              <label htmlFor="email" className="mr-2 font-semibold">Enter your email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md animate__animated ${isLoading ? 'opacity-75 cursor-not-allowed' : 'animate__fadeIn'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgetPassword;
