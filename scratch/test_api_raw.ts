import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOUR_API_KEY = process.env.VITE_TOUR_API_KEY;
const API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';

const testTourApiRaw = async () => {
  console.log('--- TourAPI Raw URL Test ---');
  
  // Try calling with raw string to avoid axios auto-encoding issues
  const url = `${API_BASE_URL}/searchFestival1?serviceKey=${TOUR_API_KEY}&_type=json&MobileOS=ETC&MobileApp=IdalTrip&eventStartDate=20260401&arrange=A&numOfRows=10&pageNo=1`;

  try {
    const response = await axios.get(url);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data).substring(0, 200));
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testTourApiRaw();
