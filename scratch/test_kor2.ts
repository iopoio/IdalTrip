import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOUR_API_KEY = process.env.VITE_TOUR_API_KEY;
const API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

const testKorService2 = async () => {
  console.log('--- TourAPI KorService2 Test ---');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/searchFestival2`, {
      params: {
        serviceKey: TOUR_API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        eventStartDate: '20260401',
        arrange: 'A',
        numOfRows: 10,
        pageNo: 1,
      },
    });

    console.log('Status:', response.status);
    console.log('Data Header:', response.data?.response?.header);
    console.log('Items Count:', response.data?.response?.body?.totalCount);
    
    if (response.data?.response?.body?.items?.item) {
       console.log('Success! Items found.');
    } else {
       console.log('Response body:', JSON.stringify(response.data?.response?.body).substring(0, 200));
    }
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testKorService2();
