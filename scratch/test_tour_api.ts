import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_TOUR_API_KEY;
const URL = 'https://apis.data.go.kr/B551011/KorService1/searchFestival1'; // Try KorService1 again but with the params that worked for KorService2 if any change

async function finalTest() {
  console.log('Testing with KorService1/searchFestival1...');
  try {
    const response = await axios.get('https://apis.data.go.kr/B551011/KorService1/searchFestival1', {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        eventStartDate: '20260401',
        numOfRows: 2,
        pageNo: 1
      }
    });
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (e: any) {
    console.log('KorService1 Failed, trying KorService2...');
    const response = await axios.get('https://apis.data.go.kr/B551011/KorService2/searchFestival2', {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        eventStartDate: '20260401',
        numOfRows: 2,
        pageNo: 1
      }
    });
    console.log('Data (KorService2):', JSON.stringify(response.data, null, 2));
  }
}

finalTest();
