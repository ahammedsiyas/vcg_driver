export const GOOGLE_MAPS_API_KEY = 'AIzaSyDsAVq5fw85qkvfSVzWzE60L_H_5yUGgZk';

export const geocodeUrl = (address) =>
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

export const directionsUrl = ({ originLat, originLng, destLat, destLng }) =>
  `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${GOOGLE_MAPS_API_KEY}`;
