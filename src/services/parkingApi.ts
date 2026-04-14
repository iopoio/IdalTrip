import type { ParkingLot } from '../types';

/**
 * Public Parking API Service (Shell)
 * Future implementation: Seoul/Local government public parking API integration
 */
export const parkingApi = {
  fetchNearbyParking: async (_lat: number, _lng: number): Promise<ParkingLot[]> => {
    try {
      // API Key is not yet provided in .env
      // Returning empty array for now to prevent app crash
      console.warn('Parking API Key missing. Returning empty results.');
      
      // Placeholder logic for future integration:
      // const response = await axios.get(PARKING_API_URL, { params: { lat, lng, radius: 1000 } });
      
      return [];
    } catch (error) {
      console.error('Failed to fetch parking lots:', error);
      return [];
    }
  }
};
