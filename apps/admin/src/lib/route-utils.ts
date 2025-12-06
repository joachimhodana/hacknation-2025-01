/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

/**
 * Calculate total distance for a route through multiple points
 * Returns distance in kilometers
 */
export function calculateRouteDistance(
  points: Array<{ lat: number; lng: number }>
): number {
  if (points.length < 2) return 0
  
  let totalDistance = 0
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    )
  }
  
  return totalDistance
}

/**
 * Calculate estimated time for a route
 * @param distanceKm - Distance in kilometers
 * @param speedKmh - Speed in kilometers per hour (default: 3 km/h for walking)
 * @returns Time in hours
 */
export function calculateEstimatedTime(
  distanceKm: number,
  speedKmh: number = 3
): number {
  return distanceKm / speedKmh
}

/**
 * Format time in hours to a readable string
 */
export function formatTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  
  if (h === 0) {
    return `${m} min`
  } else if (m === 0) {
    return `${h} ${h === 1 ? 'godz' : 'godz'}`
  } else {
    return `${h} ${h === 1 ? 'godz' : 'godz'} ${m} min`
  }
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

