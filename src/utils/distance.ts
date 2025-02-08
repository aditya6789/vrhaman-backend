import { getDistance } from 'geolib';

export async function getDistanceAndETA(originLat: number, originLng: number, destinationLat: number, destinationLng: number): Promise<any> {
  try {
    // Calculate distance using geolib
    const distanceInMeters = getDistance(
      { latitude: originLat, longitude: originLng },
      { latitude: destinationLat, longitude: destinationLng }
    );

    // Estimate duration based on a fixed speed (e.g., 50 km/h)
    const speedInMetersPerSecond = 50 * 1000 / 3600; // 50 km/h to m/s
    const durationInSeconds = Math.round(distanceInMeters / speedInMetersPerSecond);

    // Calculate estimated price (base rate + per km rate)
    const baseRates = [50, 100, 150];
    const perKmRates = [12, 15, 18];
    const distanceInKm = distanceInMeters / 1000;
    // const estimatedPrice = baseRates[0] + (distanceInKm * perKmRates[0]);

    return {
      distance: {
        meters: distanceInMeters,
        text: `${(distanceInMeters / 1000).toFixed(1)} km`
      },
      duration: {
        seconds: durationInSeconds,
        text: `${(durationInSeconds / 3600).toFixed(1)} hours`
      },
     
    };
  } catch (error) {
    console.error("Error calculating distance and ETA:", error);
    throw error;
  }
}
