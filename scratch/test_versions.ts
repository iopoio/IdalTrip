import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOUR_API_KEY = process.env.VITE_TOUR_API_KEY;

// Testing different versions
const versions = ['KorService1', 'KorService4.0'];

const testVersions = async () => {
  console.log('--- TourAPI Version & Encoding Test ---');
  
  for (const ver of versions) {
    const API_BASE_URL = `https://apis.data.go.kr/B551011/${ver}`;
    console.log(`Try version: ${ver}`);

    try {
      // searchFestival1 is version 1/2/3 style, 
      // searchFestival (no 1) or different name might be in 4.0
      // Let's try areaCodeFirst for minimal testing
      const endpoint = ver === 'KorService4.0' ? 'areaCode' : 'areaCode1';
      
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
        params: {
          serviceKey: TOUR_API_KEY, // Axios will encode this
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          numOfRows: 1,
          pageNo: 1,
        },
      });

      console.log(`[${ver}] Status:`, response.status);
      console.log(`[${ver}] Header:`, response.data?.response?.header);
    } catch (error: any) {
      console.error(`[${ver}] ❌ Failed:`, error.message);
      if (error.response) {
         console.error(`[${ver}] Response:`, JSON.stringify(error.response.data).substring(0, 100));
      }
    }
    console.log('-' * 20);
  }
};

testVersions();
