export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateCarMinutes(km: number): number {
  // 40km/h average speed, with 1.3 penalty for city driving and curves
  return Math.ceil((km / 40) * 60 * 1.3);
}

export function estimateWalkMinutes(km: number): number {
  // 4km/h average walking speed
  return Math.ceil((km / 4) * 60);
}
