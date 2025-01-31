"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Custom icons for markers
const createIcon = (iconUrl) => {
  return L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const driverIcon = createIcon("/driver.png"); // Replace with actual icon URL
const boardingIcon = createIcon("/marker.png"); // Replace with actual icon URL
const lastStopIcon = createIcon("/marker.png"); // Replace with actual icon URL

export default function ParentPage() {
  const [boardingLocation, setBoardingLocation] = useState([28.6139, 77.2090]); // Default: Delhi
  const [driverLocation, setDriverLocation] = useState([28.6206, 77.2043]); // Default: Some location near boarding
  const [lastStop, setLastStop] = useState([28.6353, 77.2250]); // Default: Another location
  const [eta, setEta] = useState(null); // Estimated time in minutes

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/trips/bus");
        const { source } = response.data;
        // setBoardingLocation([boarding.lat, boarding.lng]);
        // setDriverLocation([driver.lat, driver.lng]);
        // setLastStop([lastStop.lat, lastStop.lng]);
        // Calculate ETA

        // Hardcoded values for testing
        setBoardingLocation([28.6139, 77.2090]);
        setDriverLocation([28.6206, 77.2043]);
        setLastStop([28.6353, 77.2250]);
        calculateETA(28.6206, 77.2043, 28.6139, 77.2090);

      
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to calculate distance using Haversine Formula
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to calculate ETA (Estimated Time of Arrival)
  const calculateETA = (driverLat, driverLng, boardLat, boardLng) => {
    const distance = haversineDistance(driverLat, driverLng, boardLat, boardLng);
    console.log(distance);
    const speed = 30; // Assume bus speed in km/h (Adjust as needed)
    const time = (distance / speed) * 60; // Convert hours to minutes
    setEta(time.toFixed(2)); // Round to 2 decimal places
    console.log(time);  
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-4">Bus Tracking for Parents</h1>

      <div className="w-full max-w-4xl h-[500px] rounded-lg overflow-hidden shadow-lg">
        <MapContainer center={boardingLocation} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Boarding Location Marker */}
          <Marker position={boardingLocation} icon={boardingIcon}>
            <Popup>Boarding Location</Popup>
          </Marker>

          {/* Driver Location Marker */}
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup>Current Driver Location</Popup>
          </Marker>

          {/* Last Stop Marker */}
          <Marker position={lastStop} icon={lastStopIcon}>
            <Popup>Last Stop</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-4 bg-white p-4 shadow rounded">
        <p><strong>Boarding Location:</strong> {boardingLocation.join(", ")}</p>
        <p><strong>Driver Location:</strong> {driverLocation.join(", ")}</p>
        <p><strong>Last Stop:</strong> {lastStop.join(", ")}</p>
        <p className="text-lg font-bold mt-2">🕒 Estimated Arrival: {eta ? `${eta} minutes` : "Calculating..."}</p>
      </div>
    </div>
  );
}
