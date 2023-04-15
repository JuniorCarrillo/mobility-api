import { Coordinates } from '../models/coordinates.model';

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistance(location: Coordinates, destination: Coordinates): number {
  const R = 6371;
  const dLat = deg2rad(destination.lat - location.lat);
  const dLon = deg2rad(destination.lon - location.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location.lat)) *
      Math.cos(deg2rad(destination.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  getDistance,
};
