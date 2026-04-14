import axios from 'axios';
import type { Festival, Place } from '../types';

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
const API_KEY = import.meta.env.VITE_TOUR_API_KEY;

export const tourApi = {
  fetchFestivals: async (month: string): Promise<Festival[]> => {
    try {
      // month should be 01, 02, ..., 12
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
      console.error('Error fetching festivals:', error);
      return [];
    }
  },

  fetchPlaces: async (areaCode: string, contentTypeId: string = '12'): Promise<Place[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/areaBasedList2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          listYN: 'Y',
          arrange: 'A',
          areaCode: areaCode,
          contentTypeId: contentTypeId,
          numOfRows: 30,
          pageNo: 1
        }
      });

      const items = response.data?.response?.body?.items?.item;
      if (!items) return [];

      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('Error fetching places:', error);
      return [];
    }
  }
};
