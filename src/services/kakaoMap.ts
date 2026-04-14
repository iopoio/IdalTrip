import axios from 'axios';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const NAVI_URL = 'https://apis-navi.kakaomobility.com/v1/directions';

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
    return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
  }
};
