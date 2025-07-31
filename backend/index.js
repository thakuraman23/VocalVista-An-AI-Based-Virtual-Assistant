import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import geminiResponse from './gemini.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vocal-vista-an-ai-based-virtual-ass.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('Welcome to VocalVista API');
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

export default app;
