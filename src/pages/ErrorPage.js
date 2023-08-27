import React from "react";

const ErrorPage = ({ code }) => {
  let message = "";
  switch (code) {
    case "400":
      message = "Bad Request";
      break;
    case "401":
      message = "Unauthorized";
      break;
    case "403":
      message = "Forbidden";
      break;
    case "404":
      message = "Not Found";
      break;
    case "503":
      message = "Service Unavailable";
      break;
    default:
      message = "Unknown Error";
  }

  return (
    <div className="error-page">
      <h1>Error {code}</h1>
      <p>{message}</p>
    </div>
  );
};

export default ErrorPage;
