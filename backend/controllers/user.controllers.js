import User from '../models/user.model.js';
import uploadOnCloudinary from '../config/cloudinary.js';
import geminiResponse from '../gemini.js';
import moment from 'moment';

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(400).json({ message: 'User not found!!' });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Get Current User Error' });
  }
};

export const updateAssistant = async (req, res) => {
   try {
      const {assistantName,imageUrl} = req.body;
      let assistantImage;
      if(req.file){
         assistantImage = await uploadOnCloudinary(req.file.path);
      }else{
         assistantImage = imageUrl;
      }

      const user = await User.findByIdAndUpdate(
         req.userId,
         {assistantName,assistantImage},
         {new: true}
      ).select('-password');
      return res.status(200).json(user);
   } catch (error) {
      return res.status(400).json({ message: 'Update Assistant Error', error: error.message });
   }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string' || command.trim().length === 0) {
      return res.status(400).json({ message: 'Command is required and must be a string' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.history.push(command);
    user.save();

    const userName = user.name;
    const assistantName = user.assistantName || 'VocalVista';
    const result = await geminiResponse(command, assistantName, userName);

    let gemResult;
    try {
      const jsonMatch = result.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        return res.status(400).json({ response: "Sorry, I can't understand your command" });
      }
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return res.status(400).json({ response: "Sorry, I can't understand your command" });
    }

    const type = gemResult.type;
    switch (type) {
      case 'get_date':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format('YYYY-MM-DD')}`,
        });
      case 'get_time':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format('HH:mm A')}`,
        });
      case 'get_day':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format('dddd')}`,
        });
      case 'get_month':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format('MMMM')}`,
        });
      case 'get_year':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current year is ${moment().format('YYYY')}`,
        });
      case 'mock_interview':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
          interviewData: gemResult.interviewData || { question: 'No question provided', feedback: '', progress: { questionNumber: 1, totalQuestions: 5 }, tip: 'Be concise and confident in your answers.' },
        });
      case 'youtube_open':
      case 'google_search':
      case 'youtube_search':
      case 'youtube_play':
      case 'general':
      case 'calculator_open':
      case 'instagram_open':
      case 'facebook_open':
      case 'weather_show':
      case 'weather_forecast':
      case 'news':
      case 'wikipedia_search':
      case 'wikipedia_summary':
      case 'wikipedia_open':
      case 'wikipedia_search_and_summary':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });
      default:
        return res.status(400).json({ response: "Sorry, I can't understand your command" });
    }
  } catch (error) {
    console.error('Ask To Assistant Error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};