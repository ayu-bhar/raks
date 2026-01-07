// lib/hardware-check.js

// ⚠️ CONSTANTS - Replace with real Campus Coordinates
const CAMPUS_LAT = 25.581587; // Example: NIT Patna Lat
const CAMPUS_LNG = 84.832701; // Example: NIT Patna Lng
const ALLOWED_RADIUS_METERS = 100; // 100m is very small, 1000m is safer for testing

// Function to calculate distance between two coordinates (Haversine Formula)
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// 1. Check Location
export const checkLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          const distance = getDistanceFromLatLonInM(userLat, userLng, CAMPUS_LAT, CAMPUS_LNG);
          
          if (distance <= ALLOWED_RADIUS_METERS) {
            resolve(true); // Inside Campus
          } else {
            reject(`You are ${Math.round(distance)}m away from campus center. Allowed: ${ALLOWED_RADIUS_METERS}m.`);
          }
        },
        (error) => {
          reject("Unable to retrieve location. Please enable GPS.");
        }
      );
    }
  });
};

// 2. Check Wi-Fi (Client-Side Simulation)
// Real BSSID checks require a Native App or an Enterprise Network Setup.
// For a PWA/Web App, we usually check if the public IP matches the college IP.
export const checkNetwork = async () => {
  // Simulate a check (In production, you'd fetch('/api/check-ip'))
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return true to simulate "Connected to Campus Wi-Fi"
      // Change to false to test the error state
      resolve(true); 
    }, 1000);
  });
};