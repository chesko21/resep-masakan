import React, { useState } from "react";
import { auth } from "../services/firebase";
import "animate.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await auth.sendPasswordResetEmail(email);

      setIsEmailSent(true);
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        setError(
          "We have blocked all requests from this device due to unusual activity. Try again later."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded shadow-md m-4 opacity-90">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-4 animate__animated animate__fadeIn">
          Forgot Password
        </h2>
        {isEmailSent ? (
          <div className="text-center item-center ">
            <p className="text-green-500 mb-2 animate__animated animate__fadeIn">
              Please check your email to reset your password.
            </p>
            <p className="text-gray-600 animate__animated animate__fadeIn">
              If you don't receive an email, please check your spam folder or
              try again later.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-500 text-center mb-4 animate__animated animate__shakeX">
                {error}
              </p>
            )}
            <form
              onSubmit={handleResetPassword}
              className="space-y-4 text-center"
            >
              <label className="block">
                <span className="text-gray-700">Enter your email:</span>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mt-1 text-center block w-full h-auto rounded-md bg-primary-200 border-2 border-accent-500 focus:border-red-500 focus:ring focus:ring-secondary-500"
                />
              </label>
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-md animate__animated ${isLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "animate__fadeIn"
                  }`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
