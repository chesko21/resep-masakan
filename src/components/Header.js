import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaSignInAlt, FaUserPlus, FaUserCircle, FaUtensils,
  FaTimes, FaBook, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../services/firebase';
import '../styles/tailwind.css';

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
      navigate('/');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };


  return (
    <header className="bg-secondary-500 py-2 px-2 flex flex-wrap items-center justify-between top-0 z-10 sticky top-0">
      <Link
        to="/"
        className="heading flex items-center text-xl text-purple-700 hover:bg-yellow-500 rounded font-bold mb-2 sm:mb-0"
      >
        <FaUtensils className="logo-icon mr-2 text-purple-700 mx-2 rounded-full bg-white" /> Resep Masakan
      </Link>
      <nav className="desktop-menu items-center text-center hidden sm:block">
        <ul className="menu-items flex items-center justify-center space-x-2">
          <li>
            <Link
              to="/recipe-list" className="menu-link flex items-center text-white rounded py-2 px-3 hover:bg-yellow-500"
              onClick={closeMobileMenu}
            >
              <FaUtensils className="menu-icon mr-2" /> Resep
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="menu-link flex items-center text-white hover:bg-yellow-500 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  {userProfilePhoto ? (
                    <img
                      src={userProfilePhoto}
                      alt="Profile"
                      className="w-7 h-7 rounded-full mr-2"
                    />
                  ) : (
                    <FaUserCircle className="menu-icon mr-2" />
                  )}
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/add-recipe"
                  className="menu-link flex items-center text-white hover:bg-yellow-500 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  <FaPencilAlt className="menu-icon mr-2" /> Add Recipe
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="menu-link flex items-center text-white hover:bg-yellow-500 rounded py-2 px-3"
                >
                  <FaSignOutAlt className="menu-icon mr-2" /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="menu-link flex items-center text-white hover:bg-yellow-500 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  <FaSignInAlt className="menu-icon mr-2" /> Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="menu-link flex items-center text-white hover:bg-yellow-500 rounded py-2 px-3"
                  onClick={closeMobileMenu}
                >
                  <FaUserPlus className="menu-icon mr-2" /> Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="mobile-menu sm:hidden relative ">
        <button
          className={`menu-toggle focus:outline-none p-1 rounded-md bg-white hover:bg-yellow-600 ${
            isMobileMenuOpen ? 'close' : ''
          }`}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <FaTimes /> : 'Menu'}
        </button>
        {isMobileMenuOpen && (
          <ul className="flex-1 text-center absolute right-0 bg-purple-700 rounded shadow-md p-1 w-28 item-center">
            <li>
              <Link
                to="/recipe-list"
                className="menu-link hover:bg-yellow-500 rounded"
                onClick={closeMobileMenu}
              >
                <FaUtensils
                  className={`menu-icon mr-2 ${isMobileMenuOpen ? 'text-yellow-500' : ''}`}
                />{' '}
                Resep
              </Link>
            </li>
            {user ? (
              <>
          <li>
                <Link
                  to="/profile"
                  className={`menu-link hover:bg-yellow-600 rounded ${
                    isMobileMenuOpen ? '' : ''
                  }`}
                  onClick={closeMobileMenu}
                >
                  {userProfilePhoto ? (
                    <img
                      src={userProfilePhoto}
                      alt="Profile"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <FaUserCircle className="menu-icon mr-2" />
                  )}
                  Profile
                </Link>
              </li>
                <li>
                  <Link
                    to="/add-recipe"
                    className="menu-link hover:bg-yellow-600 rounded"
                    onClick={closeMobileMenu}
                  >
                    <FaPencilAlt
                      className={`menu-icon mr-2 ${isMobileMenuOpen ? 'text-yellow-600' : ''}`}
                    />{' '}
                    Add Recipe
                  </Link>
                </li>
                <li>
                <button
                  onClick={handleLogout}
                  className="menu-link flex items-center text-white mx-auto mt-2 text-sm hover:bg-yellow-500 rounded "
                >
                  <FaSignOutAlt className="menu-icon text-center item-center" /> Logout
                </button>
              </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="menu-link" onClick={closeMobileMenu}>
                    <FaSignInAlt
                      className={`menu-icon mr-2 ${isMobileMenuOpen ? 'text-yellow-600' : ''}`}
                    />{' '}
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="menu-link" onClick={closeMobileMenu}>
                    <FaUserPlus
                      className={`menu-icon mr-2 ${isMobileMenuOpen ? 'text-yellow-600' : ''}`}
                    />{' '}
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
