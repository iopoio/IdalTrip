/**
 * Utility functions for IdalTrip
 */

/**
 * Format KTO date string (YYYYMMDD) to readable format (YYYY.MM.DD)
 */
export const formatKTODate = (dateStr: string | undefined): string => {
  if (!dateStr || dateStr.length < 8) return '일정 정보 없음';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}.${month}.${day}`;
};

/**
 * Convert seconds to readable duration (e.g., 3660s -> 1시간 1분)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
};

/**
 * Convert meters to readable distance (e.g., 1500m -> 1.5km)
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
};
