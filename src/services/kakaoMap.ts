// Kakao Map SDK and REST API Service
export const kakaoMapService = {
  // Navigation URL generator
  getDirectionUrl: (name: string, lat: number, lng: number) => {
    return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
  },

  // Route calculation (REST API) - mocked for now
  getRoute: async (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
    console.log('Calculating route from', origin, 'to', destination);
    return {
      distance: 12000, // 12km
      duration: 1800,  // 30 mins
      path: [] // Points for drawing on map
    };
  }
};
