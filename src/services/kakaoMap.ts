import axios from 'axios';
import type { KakaoPlace } from '../types';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const NAVI_URL = '/kakao-navi/v1/directions';

export const kakaoMapService = {
  /**
   * Get car route details (distance in meters, duration in seconds)
   */
  getCarRoute: async (origin: { lng: number, lat: number }, destination: { lng: number, lat: number }) => {
    try {
      const response = await axios.get(NAVI_URL, {
        params: {
          origin: `${origin.lng},${origin.lat}`,
          destination: `${destination.lng},${destination.lat}`,
          priority: 'RECOMMEND',
          avoid: 'roadevent', // Avoid temporary road events
        },
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      });

      const route = response.data?.routes?.[0]?.summary;
      if (!route) return null;

      return {
        distance: route.distance, // meters
        duration: route.duration, // seconds
      };
    } catch (error) {
      console.error('Failed to fetch Kakao car route:', error);
      return null;
    }
  },

  /**
   * Get public route details (Shell for Phase 2 - mapped to directions API as placeholder)
   */
  getPublicRoute: async (origin: { lng: number, lat: number }, destination: { lng: number, lat: number }) => {
    try {
      // Per instructions, using the same directions endpoint with primary focus on recommendation
      const response = await axios.get(NAVI_URL, {
        params: {
          origin: `${origin.lng},${origin.lat}`,
          destination: `${destination.lng},${destination.lat}`,
          priority: 'RECOMMEND',
        },
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      });

      const route = response.data?.routes?.[0]?.summary;
      if (!route) return null;

      return {
        distance: route.distance,
        duration: Math.ceil(route.duration * 1.5), // Heuristic: Public transport takes roughly 1.5x car time
      };
    } catch (error) {
      console.error('Failed to fetch Kakao public route:', error);
      return null;
    }
  },

  /**
   * Generate a Kakao Map redirection URL for mobile/web navi
   */
  getDirectionUrl: (name: string, lat: number, lng: number) => {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
  },

  /**
   * Search places using Kakao Keyword Search API
   */
  searchPlace: async (query: string) => {
    try {
      const response = await axios.get('/kakao-local/v2/local/search/keyword.json', {
        params: { query, size: 5 },
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
      });
      return response.data.documents; // [{place_name, x(lng), y(lat), address_name}]
    } catch (error) {
      console.error('Failed to search Kakao place:', error);
      return [];
    }
  },
  /**
   * 카카오 키워드 검색 — 지역 관광지/맛집 fallback용
   */
  searchLocal: async (query: string, categoryCode: 'AT4' | 'FD6', size = 8) => {
    try {
      const response = await axios.get('/kakao-local/v2/local/search/keyword.json', {
        params: {
          query,
          category_group_code: categoryCode,
          size,
        },
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
      });
      return response.data.documents as Array<{
        id: string;
        place_name: string;
        address_name: string;
        road_address_name: string;
        category_name: string;
        x: string; // 경도(lng)
        y: string; // 위도(lat)
        place_url: string;
      }>;
    } catch (error) {
      console.error('카카오 로컬 검색 실패:', error);
      return [];
    }
  },

  /**
   * 카카오 키워드로 맛집 검색 (TourAPI 음식점 보완용)
   */
  searchRestaurants: async (keyword: string, lat: number, lng: number, radius: number = 5000): Promise<KakaoPlace[]> => {
    try {
      const response = await axios.get('/kakao-local/v2/local/search/keyword.json', {
        params: {
          query: keyword,
          category_group_code: 'FD6',
          x: String(lng),
          y: String(lat),
          radius,
          size: 15,
        },
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
      });
      return response.data.documents as KakaoPlace[];
    } catch (error) {
      console.error('카카오 맛집 검색 실패:', error);
      return [];
    }
  },
};
