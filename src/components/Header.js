import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPencilAlt,
  FaSignInAlt,
  FaUserPlus,
  FaUserCircle,
  FaUtensils,
  FaTimes,
  FaSignOutAlt,
  FaHotjar,
} from "react-icons/fa";
import { auth } from "../services/firebase";
import "../styles/tailwind.css";
import logo from '../assets/logo512.png';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setUserProfilePhoto(currentUser.photoURL);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-br from-secondary-700 via-wavy-purple to-accent-400 px-2 flex flex-wrap items-center justify-between top-0 z-10 sticky top-0 font-logo">
      <Link
        to="/"
        className="heading flex p-1 items-center text-xl text-white hover:underline rounded mb-2 sm:mb-0"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 justify-center border-2 rounded-full mr-2"
        />
        Resep Masakan
      </Link>
      <nav className="desktop-menu items-center text-center hidden sm:block">
        <ul className="menu-items flex items-center justify-center space-x-2">
          <li>
            <Link
              to="/recipe-list"
              className="menu-link flex items-center text-white rounded py-2 px-3 hover:bg-accent-400"
              onClick={() => {
                const recipelistSection = document.getElementById("recipelist-section");
                if (recipelistSection) {
                  const sectionTop = recipelistSection.offsetTop;
                  window.scrollTo({ top: sectionTop, behavior: "smooth" });
                }
                closeMobileMenu();
              }}
            >
              <FaUtensils className="menu-icon m-auto text-center text-yellow-400" /> Recipe
            </Link>
          </li>
          <li>
            <Link
              to="/tranding"
              className="menu-link flex items-center text-white rounded py-2 px-3 hover:bg-accent-400"
              onClick={() => {
                const trandingSection = document.getElementById("tranding-section");
                if (trandingSection) {
                  const sectionTop = trandingSection.offsetTop;
                  window.scrollTo({ top: sectionTop, behavior: "smooth" });
                }
                closeMobileMenu();
              }}
            >
              <FaHotjar className="menu-icon m-auto text-center text-yellow-400" /> Trending
            </Link>
          </li>


          {user ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="menu-link flex items-center text-white hover:bg-accent-400 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  {userProfilePhoto ? (
                    <img
                      src={userProfilePhoto}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mr-2 border-2"
                    />
                  ) : (
                    <FaUserCircle className="menu-icon m-auto text-center text-yellow-400" />
                  )}
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/add-recipe"
                  className="menu-link flex items-center text-white rounded py-2 px-3 hover:bg-accent-400"
                  onClick={closeMobileMenu}
                >
                  <FaPencilAlt className="menu-icon m-auto text-center text-yellow-400" /> Add Recipe
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="menu-link flex items-center text-white hover:bg-accent-400 rounded py-2 px-3"
                >
                  <FaSignOutAlt className="menu-icon m-auto text-center text-yellow-400" />
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="menu-link flex items-center text-white hover:bg-accent-400 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  <FaSignInAlt className="menu-icon m-auto text-center text-yellow-400" /> Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="menu-link flex items-center text-white hover:bg-accent-400 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  <FaUserPlus className="menu-icon m-auto text-center text-yellow-400" /> Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="mobile-menu sm:hidden relative justify-center text-center ">
        <button
          className={`menu-toggle focus:outline-none p-1 rounded-md bg-white hover:bg-accent-400 ${isMobileMenuOpen ? "close" : ""
            }`}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <FaTimes /> : "Menu"}
        </button>
        {isMobileMenuOpen && (
          <ul className="flex-1 absolute right-0 bg-secondary-500 rounded shadow-md mr-2 w-28">
            <li>
              <Link
                to="/recipe-list"
                className="menu-link hover:bg-accent-400 rounded block py-2"
                onClick={() => {
                  const recipelistSection = document.getElementById("recipelist-section");
                  if (recipelistSection) {
                    const sectionTop = recipelistSection.offsetTop;
                    window.scrollTo({ top: sectionTop, behavior: "smooth" });
                  }
                  closeMobileMenu();
                }}
              >
                <FaUtensils className="menu-icon m-auto text-center text-yellow-400" /> Recipe
              </Link>
            </li>
            <li>
              <Link
                to="/tranding"
                className="menu-link hover:bg-accent-400 rounded block py-2"
                onClick={() => {
                  const trandingSection = document.getElementById("tranding-section");
                  if (trandingSection) {
                    const sectionTop = trandingSection.offsetTop;
                    window.scrollTo({ top: sectionTop, behavior: "smooth" });
                  }
                  closeMobileMenu();
                }}
              >
                <FaHotjar className="menu-icon m-auto text-center text-yellow-400" />
                Trending
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="menu-link hover:bg-accent-400 rounded block py-2"
                    onClick={closeMobileMenu}
                  >
                    {userProfilePhoto ? (
                      <img
                        src={userProfilePhoto}
                        alt="Profile"
                        className="w-6 h-6 rounded-full border m-auto"
                      />
                    ) : (
                      <FaUserCircle className="menu-icon m-auto text-center text-yellow-400" />
                    )}
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/add-recipe"
                    className="menu-link hover:bg-accent-400 rounded block py-2"
                    onClick={closeMobileMenu}
                  >
                    <FaPencilAlt className="menu-icon m-auto text-center text-yellow-400" />
                    Add Recipe
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="menu-link flex items-center text-white mx-auto mt-2 text-sm hover:bg-accent-400 rounded block py-2"
                  >
                    <FaSignOutAlt className="menu-icon m-auto text-center text-yellow-400" />{" "}

                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="menu-link hover:bg-accent-400 rounded block py-2"
                    onClick={closeMobileMenu}
                  >
                    <FaSignInAlt
                      className={`menu-icon m-auto text-center text-yellow-400 ${isMobileMenuOpen ? "text-yellow-400" : ""
                        }`}
                    />{" "}
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="menu-link hover:bg-accent-400 rounded block py-2"
                    onClick={closeMobileMenu}
                  >
                    <FaUserPlus
                      className={`menu-icon m-auto text-center text-yellow-400 ${isMobileMenuOpen ? "text-yellow-400" : ""
                        }`}
                    />{" "}
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;
