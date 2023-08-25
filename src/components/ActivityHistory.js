import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';

const MAX_ACTIVITIES = 5;

const ActivityHistory = ({ authorId }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const limitActivities = (activities) => {
    if (activities.length > MAX_ACTIVITIES) {
      return activities.slice(0, MAX_ACTIVITIES);
    } else {
      return activities;
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);

        const userRef = db.collection('users').doc(authorId);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          const userActivities = userData.activity || [];

          userActivities.reverse(); 

          // Limit the activities to 5
          const limitedActivities = limitActivities(userActivities);

          // Update the activities array in the database
          await userRef.update({ activity: limitedActivities });

          setActivities(limitedActivities);
          setUser(userData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [authorId]);

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-white z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      ) : (
        <div className="mx-auto w-64 p-2">
          {user && <h2 className="text-2xl font-semibold mb-2">{user.displayName}</h2>}
          <ul className="space-y-1">
            {activities.map((activity, index) => (
              <li
                key={index}
                className={`p-2 border border-gray-300 rounded-lg ${index === 0 ? 'bg-yellow-100' : 'bg-white'
                  }`}
              >
                <p className="font-10 mb-2">New Recipe Add: </p>
                <p className="text-orange-500 font-semibold mb-2">{activity.recipeName}</p>
                <p className="text-gray-500">
                  Date: {new Date(activity.date.seconds * 1000).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default ActivityHistory;
