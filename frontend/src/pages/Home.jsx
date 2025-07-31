import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

const Home = () => {
  const { serverUrl, userData, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [activated, setActivated] = useState(false);
  const [interviewState, setInterviewState] = useState(null);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");

  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const fallbackRef = useRef(null);
  const isRecognizingRef = useRef(false);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signup");
    } catch (error) {
      setUserData(null);
      console.error("Logout failed:", error);
    }
  };

  const speak = (text) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    const speakNow = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
      synth.speak(utterance);
    };
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAiText("");
      setTimeout(() => {
        if (recognitionRef.current && !isRecognizingRef.current && !isSpeakingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.log("Recognition restart error:", err);
          }
        }
      }, 500);
    };
  };

  const handleCommand = (data) => {
    if (!data) return;
    const { type, userInput, response, interviewData } = data;
    setAiText(response);
    speak(response);

    switch (type) {
      case 'general':
        break;
      case 'google_search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'youtube_search':
      case 'youtube_play':
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'youtube_open':
        window.open('https://www.youtube.com/', '_blank');
        break;
      case 'calculator_open':
        window.open(`https://www.google.com/search?q=calculator`, '_blank');
        break;
      case 'instagram_open':
        window.open(`https://www.instagram.com/`, '_blank');
        break;
      case 'facebook_open':
        window.open(`https://www.facebook.com/`, '_blank');
        break;
      case 'weather_show':
        window.open(`https://www.google.com/search?q=weather`, '_blank');
        break;
      case 'weather_forecast':
        window.open(`https://www.google.com/search?q=weather+forecast+${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'news':
        window.open(userInput ? `https://news.google.com/search?q=${encodeURIComponent(userInput)}` : `https://news.google.com/`, '_blank');
        break;
      case 'wikipedia_search':
        window.open(`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'wikipedia_summary':
        break;
      case 'wikipedia_open':
        window.open(userInput.includes('http') ? userInput : `https://en.wikipedia.org/wiki/${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'wikipedia_search_and_summary':
        window.open(`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'get_date':
      case 'get_time':
      case 'get_day':
      case 'get_month':
      case 'get_year':
        break;
      case 'mock_interview':
        setInterviewState({
          question: interviewData?.question || 'No question provided',
          feedback: interviewData?.feedback || '',
          progress: interviewData?.progress || { questionNumber: 1, totalQuestions: 10 },
          tip: interviewData?.tip || 'Be concise and confident.'
        });
        break;
      default:
        break;
    }
  };

  const safeRecognition = () => {
    console.log("safeRecognition called", {
      isSpeaking: isSpeakingRef.current,
      isRecognizing: isRecognizingRef.current,
      hasRecognition: !!recognitionRef.current
    });
    
    if (!isSpeakingRef.current && !isRecognizingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Recognition started successfully");
      } catch (error) {
        console.log("Recognition start error:", error.name, error.message);
        if (error.name !== "InvalidStateError") {
          setTimeout(() => {
            if (!isSpeakingRef.current && !isRecognizingRef.current) {
              safeRecognition();
            }
          }, 2000);
        }
      }
    }
  };

  const handleActivate = () => {
    setActivated(true);
    if (userData?.name) {
      speak(`Hello ${userData.name}, how can I help you!`);
    } else {
      speak("Hello, how can I help you!");
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use a compatible browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;
    isRecognizingRef.current = false;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      console.log("Recognition ended, restarting...");

      if (!isSpeakingRef.current) {
        setTimeout(() => {
          if (!isSpeakingRef.current && !isRecognizingRef.current) {
            console.log("Attempting to restart recognition");
            safeRecognition();
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setListening(false);
      console.log("Recognition error:", event.error);
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition();
        }, 2000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("Heard:", transcript);

      const isInInterviewMode = interviewState !== null;
      const containsAssistantName = transcript.toLowerCase().includes(userData?.assistantName?.toLowerCase());
      if (containsAssistantName || isInInterviewMode) {
        console.log(isInInterviewMode ? "Interview mode - processing answer" : "Assistant name detected, processing...");
        setAiText("");
        setUserText(transcript);
        
        try {
          recognition.stop();
        } catch (e) {}
        isRecognizingRef.current = false;
        setListening(false);
        
        try {
          const data = await getGeminiResponse(transcript);
          handleCommand(data);
          setUserText("");
        } catch (error) {
          console.error("Gemini response error:", error);
          setUserText("");
          setTimeout(() => {
            safeRecognition();
          }, 1000);
        }
      } else {
        console.log("Assistant name not detected and not in interview mode:", transcript);
      }
    };

    if (fallbackRef.current) clearInterval(fallbackRef.current);
    fallbackRef.current = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognition();
      }
    }, 10000);

    setTimeout(() => {
      safeRecognition();
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setListening(false);
      isRecognizingRef.current = false;
      if (fallbackRef.current) clearInterval(fallbackRef.current);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex flex-col gap-3 items-end pt-4 sm:pt-6 lg:flex-row lg:justify-end lg:gap-4">
        <button
          className="w-full max-w-[200px] h-12 bg-white text-black font-bold rounded-full text-sm sm:text-base whitespace-nowrap px-4 py-2 cursor-pointer lg:absolute lg:top-4 lg:right-8"
          onClick={handleLogout}
        >
          Log Out
        </button>
        <button
          className="w-full max-w-[200px] sm:max-w-[260px] lg:max-w-[320px] h-12 bg-white text-black font-bold rounded-full text-sm sm:text-base lg:text-lg whitespace-nowrap px-4 py-2 cursor-pointer lg:absolute lg:top-20 lg:right-8"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>
      </div>

      <div className="w-[90vw] max-w-[300px] h-[60vw] max-h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-lg mt-16 md:mt-0">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] md:text-[20px] font-semibold mb-4 mt-4 text-center">
        Hi !! I'm{" "}
        <span className="text-pink-600">{userData?.assistantName}..</span>
      </h1>
      {!activated && (
        <button
          className="w-full max-w-[200px] sm:max-w-[240px] h-12 bg-white text-black font-bold rounded-full text-sm sm:text-base whitespace-nowrap px-4 py-2 shadow-lg cursor-pointer"
          onClick={handleActivate}
        >
          Activate Assistant
        </button>
      )}

      {/* Fixed: Show userImg when listening, aiImg when AI is responding */}
      {activated && !aiText && <img src={userImg} alt="User" className="h-[160px]" />}
      {activated && aiText && <img src={aiImg} alt="AI" className="h-[160px]" />}

      {/* Show listening indicator */}
      {activated && listening && !userText && !aiText && (
        <div className="text-blue-400 text-sm">🎤 Listening...</div>
      )}

      {activated && <h1 className="text-pink-600 text-[18px] font-bold text-wrap">{userText ? userText : aiText ? aiText : ""}</h1>}

      {interviewState && (
        <div className="w-[90vw] max-w-[600px] bg-white/10 backdrop-blur-md p-4 rounded-lg text-white mt-4">
          <h2 className="text-lg font-bold">Mock Interview</h2>
          <p>
            Question {interviewState.progress.questionNumber}/
            {interviewState.progress.totalQuestions}: {interviewState.question}
          </p>
          {interviewState.feedback && (
            <p className="mt-2">Feedback: {interviewState.feedback}</p>
          )}
          <p className="mt-2 text-sm italic">Tip: {interviewState.tip}</p>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-pink-600 h-2 rounded-full"
              style={{
                width: `${
                  (interviewState.progress.questionNumber /
                    interviewState.progress.totalQuestions) *
                  100
                }%`,
              }}
            ></div>
          </div>
          <button
            className="w-full max-w-[200px] h-10 mt-4 bg-pink-600 text-white font-bold rounded-full text-sm sm:text-base whitespace-nowrap px-4 py-2 cursor-pointer"
            onClick={() => setInterviewState(null)}
          >
            End Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;