import React from "react";
import { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Customize2 = () => {
  const { serverUrl, userData, backendImage, selectedImage, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let result;
      if (backendImage) {
        let formData = new FormData();
        formData.append("assistantName", assistantName);
        formData.append("assistantImage", backendImage);
        result = await axios.post(`${serverUrl}/api/user/update`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (selectedImage) {
        result = await axios.post(
          `${serverUrl}/api/user/update`,
          {
            assistantName,
            imageUrl: selectedImage,
          },
          { withCredentials: true }
        );
      } else {
        throw new Error("Please select or upload an assistant image.");
      }

      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error("Error updating assistant:", error);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex flex-col items-center justify-center p-5 relative">
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/customize")}
      />
      <h1 className="text-white mb-10 text-3xl text-center">
        Select Your <span className="text-pink-600">Assistant Name..</span>
      </h1>

      <input
        type="text"
        placeholder="Assistant Name.. (eg: Jarvis)"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {assistantName && (
        <button
          className="min-w-[300px] h-[50px] mt-[30px] text-black font-bold bg-white rounded-full cursor-pointer"
          type="submit"
          onClick={() => {
            handleUpdateAssistant();
          }}
          disabled={loading}
        >
          {!loading ? "Create Your Assistant" : "Loading..."}
        </button>
      )}
    </div>
  );
};

export default Customize2;
