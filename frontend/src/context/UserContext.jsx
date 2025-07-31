import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = 'http://localhost:8000';
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  const getGeminiResponse = async (command) => {
     try {
        const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, {
          command: command
        }, {
          withCredentials: true,
        });
        return result.data;
     } catch (error) {
        console.error('Error fetching Gemini response:', error);
        return null;
     }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    handleCurrentUser,
    getGeminiResponse
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;