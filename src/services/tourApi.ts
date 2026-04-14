import axios from 'axios';
import type { Festival, Place } from '../types';

const BASE_URL = import.meta.env.DEV 
  ? '/B551011/KorService2' 
  : 'https://apis.data.go.kr/B551011/KorService2';
const API_KEY = import.meta.env.VITE_TOUR_API_KEY;

export const tourApi = {
  fetchFestivals: async (month: string): Promise<Festival[]> => {
    try {
      const formattedMonth = month.padStart(2, '0');
      const year = new Date().getFullYear();
      const startDate = `${year}${formattedMonth}01`;

      const response = await axios.get(`${BASE_URL}/searchFestival2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          listYN: 'Y',
          arrange: 'A',
          eventStartDate: startDate,
          numOfRows: 20,
          pageNo: 1
        }
      });

      const items = response.data?.response?.body?.items?.item;
      if (!items) return [];
      
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('Failed to fetch festivals:', error);
      return [];
    }
  },

  fetchFestivalDetail: async (contentId: string): Promise<Festival | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/detailCommon2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          contentId: contentId,
          defaultYN: 'Y',
          overviewYN: 'Y',
          addrinfoYN: 'Y',
          mapinfoYN: 'Y',
          firstImageYN: 'Y'
        }
      });

      const item = response.data?.response?.body?.items?.item?.[0] || response.data?.response?.body?.items?.item;
      return item || null;
    } catch (error) {
      console.error('Failed to fetch festival detail:', error);
      return null;
    }
  },

  fetchNearbyPlaces: async (mapx: string, mapy: string, radius: number = 10000, contentTypeId?: string): Promise<Place[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/locationBasedList2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          mapX: mapx,
          mapY: mapy,
          radius: radius,
          contentTypeId: contentTypeId, // 12=Attraction, 39=Food
          listYN: 'Y',
          arrange: 'A',
          numOfRows: 20
        }
      });

      const items = response.data?.response?.body?.items?.item;
      if (!items) return [];
      
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
      return [];
    }
  }
};
