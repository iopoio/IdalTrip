import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_TOUR_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

async function test() {
  console.log("Testing fetchFestivalsByRegionAndDate...");
  try {
    const res = await axios.get(`${BASE_URL}/searchFestival2`, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        arrange: 'C',
        eventStartDate: '20260503',
        eventEndDate: '20260503',
        areaCode: 32, // 강원
        numOfRows: 20,
        pageNo: 1,
      }
    });
    console.log("Festivals:", res.data?.response?.body?.items?.item?.length || 0, "items");
  } catch(e) {
    console.error("Festivals error", e.message);
  }

  console.log("Testing fetchPlacesByRegion...");
  try {
    const res = await axios.get(`${BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        arrange: 'C',
        contentTypeId: '12',
        areaCode: 32, // 강원
        numOfRows: 2,
        pageNo: 1,
      }
    });
    const items = res.data?.response?.body?.items?.item || [];
    console.log("Places:", items.length, "items");
    if (items.length > 0) {
      console.log("Testing fetchDetailIntro for:", items[0].contentid);
      const detailRes = await axios.get(`${BASE_URL}/detailIntro2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          contentId: items[0].contentid,
          contentTypeId: '12',
        }
      });
      console.log("Detail Intro:", detailRes.data?.response?.body?.items?.item[0] || detailRes.data?.response?.body?.items?.item || null);
    }
  } catch(e) {
    console.error("Places error", e.message);
  }
}

test();
