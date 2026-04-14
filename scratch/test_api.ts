import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOUR_API_KEY = process.env.VITE_TOUR_API_KEY;
const API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';

const testTourApi = async () => {
  console.log('--- TourAPI Connection Test ---');
  console.log('API KEY:', TOUR_API_KEY?.substring(0, 10) + '...');
  
  const currentMonth = new Date().getMonth() + 1;
  const monthStr = currentMonth.toString().padStart(2, '0');
  const year = new Date().getFullYear();

  try {
    const response = await axios.get(`${API_BASE_URL}/searchFestival1`, {
      params: {
        serviceKey: TOUR_API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        eventStartDate: `${year}${monthStr}01`,
        arrange: 'A',
        numOfRows: 10,
        pageNo: 1,
      },
    });

    console.log('Status:', response.status);
    console.log('Data Header:', response.data?.response?.header);
    console.log('Summary Content Count:', response.data?.response?.body?.totalCount);
    
    if (response.data?.response?.body?.items === "") {
       console.warn('⚠️ Warning: API returned empty string for items. This usually means no results OR Invalid Key.');
    } else {
       console.log('Items sample:', response.data?.response?.body?.items?.item?.[0]?.title);
    }
  } catch (error: any) {
    console.error('❌ API Call Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
};

testTourApi();
