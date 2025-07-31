import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {userDataContext} from '../context/UserContext.jsx';
import bg from '../assets/bg2.jpg';

const SignIn = () => {
  const navigate = useNavigate();
  const {serverUrl,userData,setUserData} = useContext(userDataContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/login`, {email, password }, {
        withCredentials: true,
      });
      setUserData(result.data);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setUserData(null);
      setLoading(false);
      setError(err.response?.data?.message || 'Signin failed');
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] max-w-[500px] h-[600px] bg-[#00000062] backdrop-blur-sm shadow-lg shadow-gray-900 flex flex-col justify-center items-center gap-[20px] px-[20px]"
        onSubmit={handleSignIn}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In to <span className="text-pink-600">VocalVista</span>
        </h1>
        {error && <p className="text-red-500 text-[18px]">{error}</p>}
        <input
          type="email"
          placeholder="Email.."
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder="Password.."
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-bold bg-white rounded-full" disabled={loading} type="submit">
         {loading?"Loading...":"Sign In"} 
        </button>
        <p className="text-white text-[18px] cursor-pointer" onClick={() => navigate('/signup')}>
          Want to create a new account? <span className="text-blue-400">Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default SignIn;