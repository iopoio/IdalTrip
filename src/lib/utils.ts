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

/**
 * Get festival status based on dates
 * Returns: '진행중' | '예정' | '종료'
 */
export const getFestivalStatus = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '정보없음';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(
    parseInt(startDate.substring(0, 4)),
    parseInt(startDate.substring(4, 6)) - 1,
    parseInt(startDate.substring(6, 8))
  );

  const end = endDate ? new Date(
    parseInt(endDate.substring(0, 4)),
    parseInt(endDate.substring(4, 6)) - 1,
    parseInt(endDate.substring(6, 8))
  ) : start;

  if (today < start) return '예정';
  if (today > end) return '종료';
  return '진행중';
};
