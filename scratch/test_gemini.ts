import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3-flash-preview'; 
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testGemini() {
  if (!API_KEY) {
    console.error('Error: VITE_GEMINI_API_KEY is not defined in .env');
    return;
  }

  try {
    const response = await axios.post(BASE_URL, {
      contents: [{
        parts: [{ text: "Travel tip for Korea." }]
      }]
    });

    console.log('Gemini Response:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error: any) {
    if (error.response) {
      console.error('Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGemini();
