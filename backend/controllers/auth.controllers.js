import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import genToken from '../config/token.js';
import asyncHandler from 'express-async-handler';

const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, 
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  path: '/'
});

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long!!' });
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  
  const token = await genToken(user._id);
  
  res.cookie("token", token, getCookieOptions());
  
  const userResponse = { ...user.toObject() };
  delete userResponse.password;
  
  return res.status(201).json({
    message: 'User created successfully',
    user: userResponse,
    token: token 
  });
});

export const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User does not exist!' });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect Password!' });
  }
  
  const token = await genToken(user._id);
  
  res.cookie("token", token, getCookieOptions());

  const userResponse = { ...user.toObject() };
  delete userResponse.password;
  
  console.log('Login successful, cookie set with options:', getCookieOptions());
  
  return res.status(200).json({
    message: 'Login successful',
    user: userResponse,
    token: token 
  });
});

export const logOut = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  
  return res.status(200).json({ message: 'Logged out successfully' });
});
