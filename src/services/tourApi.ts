import axios from 'axios';
import type { Festival, Place } from '../types';

const BASE_URL = '/B551011/KorService2';
const API_KEY = import.meta.env.VITE_TOUR_API_KEY;

export const REGION_AREA_CODES: Record<string, number[]> = {
  '서울/경기': [1, 2, 31],
  '강원': [32],
  '충청': [3, 8, 33, 34],
  '전라': [5, 37, 38],
  '경상': [4, 6, 7, 35, 36],
  '제주': [39],
};

export const tourApi = {
  fetchFestivals: async (month: string): Promise<Festival[]> => {
    try {
      const formattedMonth = month.padStart(2, '0');
      const year = new Date().getFullYear();
      const startDate = `${year}${formattedMonth}01`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      const endDate = `${year}${formattedMonth}${lastDay}`;

      const response = await axios.get(`${BASE_URL}/searchFestival2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          arrange: 'O',
          eventStartDate: startDate,
          eventEndDate: endDate,
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
          contentId: contentId
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
          contentTypeId: contentTypeId,
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
  },

  fetchFestivalsByRegionAndDate: async (region: string, date: string): Promise<Festival[]> => {
    // date: 'YYYY-MM-DD' 형식
    const areaCodes = REGION_AREA_CODES[region] || [];
    const dateFormatted = date.replace(/-/g, ''); // YYYYMMDD
  
    try {
      const results = await Promise.all(
        areaCodes.map(areaCode =>
          axios.get(`${BASE_URL}/searchFestival2`, {
            params: {
              serviceKey: API_KEY,
              _type: 'json',
              MobileOS: 'ETC',
              MobileApp: 'IdalTrip',
              arrange: 'C',
              eventStartDate: dateFormatted,
              eventEndDate: dateFormatted,
              areaCode,
              numOfRows: 20,
              pageNo: 1,
            }
          })
        )
      );
  
      const items = results.flatMap(r => {
        const raw = r.data?.response?.body?.items?.item;
        if (!raw) return [];
        return Array.isArray(raw) ? raw : [raw];
      });
  
      return items;
    } catch (error) {
      console.error('Failed to fetch festivals by region and date:', error);
      return [];
    }
  },

  fetchPlacesByRegion: async (region: string, contentTypeId: string): Promise<Place[]> => {
    const areaCodes = REGION_AREA_CODES[region] || [];
  
    try {
      const results = await Promise.all(
        areaCodes.map(areaCode =>
          axios.get(`${BASE_URL}/areaBasedList2`, {
            params: {
              serviceKey: API_KEY,
              _type: 'json',
              MobileOS: 'ETC',
              MobileApp: 'IdalTrip',
              arrange: 'C',
              contentTypeId,
              areaCode,
              numOfRows: 10,
              pageNo: 1,
            }
          })
        )
      );
  
      const items = results.flatMap(r => {
        const raw = r.data?.response?.body?.items?.item;
        if (!raw) return [];
        return Array.isArray(raw) ? raw : [raw];
      });
  
      return items.slice(0, 20);
    } catch (error) {
      console.error('Failed to fetch places by region:', error);
      return [];
    }
  },

  fetchDetailIntro: async (contentId: string, contentTypeId: string): Promise<any> => {
    try {
      const response = await axios.get(`${BASE_URL}/detailIntro2`, {
        params: {
          serviceKey: API_KEY,
          _type: 'json',
          MobileOS: 'ETC',
          MobileApp: 'IdalTrip',
          contentId,
          contentTypeId,
        }
      });
      const item = response.data?.response?.body?.items?.item;
      return Array.isArray(item) ? item[0] : item || null;
    } catch (error) {
      console.error('Failed to fetch detail intro:', error);
      return null;
    }
  }
};
