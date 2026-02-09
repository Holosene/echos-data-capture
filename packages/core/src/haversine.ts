/**
 * Haversine distance between two WGS-84 coordinates.
 * Returns distance in meters.
 */

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Compute cumulative distances along a sequence of lat/lon points.
 * Returns array of same length with cumulative distance in meters.
 * First element is always 0.
 */
export function cumulativeDistances(
  points: Array<{ lat: number; lon: number }>,
): number[] {
  const distances = new Array<number>(points.length);
  distances[0] = 0;
  for (let i = 1; i < points.length; i++) {
    const d = haversineDistance(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon,
    );
    distances[i] = distances[i - 1] + d;
  }
  return distances;
}
