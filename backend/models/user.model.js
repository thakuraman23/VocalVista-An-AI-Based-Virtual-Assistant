import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  assistantName: {
    type: String,
  },
  assistantImage: {
    type: String,
  },
  history:[{
    type: String,
  }]
},{
  timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;