import React, { useEffect, useState } from 'react';
import { auth, db, handleUploadPhoto, createUserProfileDocument } from '../services/firebase';
import defaultProfileImage from '../assets/profile.svg';
import { FiEdit } from 'react-icons/fi';
import { MdAddAPhoto } from 'react-icons/md';
import { ClipLoader } from 'react-spinners';
import ActivityFloatButton from '../button/ActivityFloatButton';
import RecipeUser from '../components/RecipeUser';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const { authorId } = useParams();
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultImageURL, setDefaultImageURL] = useState(defaultProfileImage);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const DEFAULT_PROFILE_IMAGE = defaultProfileImage;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        try {
          await createUserProfileDocument(userAuth);
          const userRef = db.collection('users').doc(userAuth.uid);
          const snapshot = await userRef.get();

          if (snapshot.exists) {
            const userData = snapshot.data();
            setUser(userData);
            setDefaultImageURL(userData.photoURL || defaultProfileImage);
          } else {
            const defaultUserData = {
              displayName: userAuth.displayName || 'Unknown',
              email: userAuth.email,
              photoURL: userAuth.photoURL || defaultProfileImage,
            };
            await userRef.set(defaultUserData);
            setUser(defaultUserData);
            setDefaultImageURL(defaultProfileImage);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
          setAuthReady(true);
        }
      } else {
        setUser(null);
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDefaultImageURL = async () => {
      try {
        const userRef = db.collection('users').doc(authorId);
        const snapshot = await userRef.get();

        if (snapshot.exists) {
          const { photoURL } = snapshot.data();
          if (photoURL) {
            setDefaultImageURL(photoURL);
          } else {
            setDefaultImageURL(defaultProfileImage);
          }
        } else {
          setDefaultImageURL(defaultProfileImage);
        }
      } catch (error) {
        console.error('Error retrieving default profile image URL:', error);
      }
    };

    if (user && !defaultImageURL) {
      fetchDefaultImageURL();
    }
  }, [user, defaultImageURL, authorId]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setNewPhoto(file);
    try {
      setLoading(true);

      if (file) {
        const photoUrl = await handleUploadPhoto(auth.currentUser, file, setLoading, setUser);

        if (photoUrl) {
          const updatedProfile = {
            photoURL: photoUrl,
          };

          await createUserProfileDocument(auth.currentUser, updatedProfile);
          setUser((prevUser) => ({
            ...prevUser,
            photoURL: photoUrl,
          }));
          updateRecipesAuthor(auth.currentUser.uid, user.displayName, photoUrl);
        } else {
          console.error('Invalid image URL.');
        }
      } else {
        setUser((prevUser) => ({
          ...prevUser,
          photoURL: user.photoURL || defaultProfileImage,
        }));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecipesAuthor = async (authorId, newDisplayName, newPhotoURL) => {
    try {
      const userRecipesRef = db.collection('recipes').where('authorId', '==', authorId);
      const snapshot = await userRecipesRef.get();

      const batch = db.batch();
      snapshot.forEach((doc) => {
        const recipeRef = db.collection('recipes').doc(doc.id);
        batch.update(recipeRef, { author: newDisplayName, photoURL: newPhotoURL });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating recipes author:', error);
    }
  };

  const handlePopupClose = () => {
    console.log('Popup Closed');
    setIsPopupOpen(false);
    setNewDisplayName(user.displayName || '');
    localStorage.removeItem('newDisplayName');
  };

  const handleDisplayNameClick = () => {
    setIsPopupOpen(true);
    setNewDisplayName(user.displayName || '');
  };

  const handleDisplayNameUpdate = async () => {
    setLoading(true);

    try {

      await auth.currentUser.updateProfile({
        displayName: newDisplayName,
      });

      await createUserProfileDocument(auth.currentUser, { displayName: newDisplayName });

      const userRecipesRef = db.collection('recipes').where('authorId', '==', auth.currentUser.uid);
      const snapshot = await userRecipesRef.get();

      const updateRecipePromises = snapshot.docs.map(async (doc) => {
        const recipeRef = db.collection('recipes').doc(doc.id);
        await recipeRef.update({ author: newDisplayName });
      });

      await Promise.all(updateRecipePromises);

      setUser((prevUser) => ({
        ...prevUser,
        displayName: newDisplayName,
      }));

      setNewDisplayName(newDisplayName);
      localStorage.setItem('newDisplayName', newDisplayName);

      setLoading(false);
      handlePopupClose();
    } catch (error) {
      console.error('Error updating display name:', error);
      setLoading(false);
    }
  };

  if (!authReady) {
    return (
      <div className="flex flex-col items-center px-4 py-4 bg-purple-700 border-top">
        <ClipLoader size={50} color={'#fff'} loading={!authReady} />LOADING...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center px-4 py-4 bg-purple-700 border-top">
        You are not logged in.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center px-4 py-4 bg-gradient-to-br from-purple-700 to-pink-500 font-logo">
        <div className="w-32 h-32 relative rounded-full">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile Preview"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <img
              src={defaultImageURL}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-2"
            />
          )}
          <label
            htmlFor="photoUpload"
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer transition-opacity hover:opacity-75"
          >
            <MdAddAPhoto className="h-6 w-6 text-blue-500" />
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="flex flex-row items-center mt-4">
          <p className="text-xl text-white text-center item-center justify-center">{user.displayName}</p>
          <div
            className="flex flex-col items-center text-blue-500 m-1 cursor-pointer transition-opacity hover:opacity-75"
            onClick={handleDisplayNameClick}
          >
            <FiEdit className="mr-1" />
          </div>
        </div>
        <p className="text-amber-500 mb-4">{user.email}</p>
        {isPopupOpen && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-purple-200 bg-opacity-50 z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Edit Display Name</h2>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded mb-4"
                placeholder="Enter new display name"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                  onClick={handleDisplayNameUpdate}
                >
                  Update
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={handlePopupClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <RecipeUser authorId={auth.currentUser.uid} />
      </div>

      <div>
        <ActivityFloatButton authorId={auth.currentUser.uid} />
      </div>
    </>
  );
};

export default Profile;
