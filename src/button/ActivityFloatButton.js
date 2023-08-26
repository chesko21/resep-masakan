import React, { useEffect, useState, useRef } from 'react';
import { FiActivity } from 'react-icons/fi';
import Draggable from 'react-draggable';
import ActivityHistory from '../components/ActivityHistory';
import { BeatLoader } from 'react-spinners';

const ActivityFloatButton = ({ authorId }) => {
  const [showActivity, setShowActivity] = useState(false);
  const draggableRef = useRef(null);
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleToggleActivity = () => {
    setShowActivity((prevShowActivity) => !prevShowActivity);
  };

  const handleTouchToggleActivity = () => {
    setShowActivity((prevShowActivity) => !prevShowActivity);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActivity && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowActivity(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActivity]);

  return (
    <div className="fixed bottom-4 md:bottom-8 right-4 z-30">
      <Draggable nodeRef={draggableRef}>
        <div ref={draggableRef}>
          <button
            className="bg-yellow-500 text-blue rounded-full p-3 shadow hover:bg-purple-600 cursor-pointer focus:outline-none"
            onClick={handleToggleActivity}
            onTouchStart={handleTouchToggleActivity}
            ref={buttonRef}
          >
            <FiActivity size={24} />
          </button>
        </div>
      </Draggable>
      {showActivity && (
        <div className="bg-blue-300 rounded-lg p-3 shadow mt-2 text-xs md:text-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-16 w-16">
              <BeatLoader color="#000000" loading={isLoading} size={16} />
            </div>
          ) : (
            <ul>
              <ActivityHistory authorId={authorId} />
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFloatButton;
