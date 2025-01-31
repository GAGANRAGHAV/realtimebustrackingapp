"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline 
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [tripRoutes, setTripRoutes] = useState({});
  const [tripLocations, setTripLocations] = useState({});
  const [statusMessages, setStatusMessages] = useState({});
  const [driverLocation, setDriverLocation] = useState(null);

  const markerIcon = new L.Icon({
    iconUrl: "/marker.png",
    iconSize: [35, 45],
  });

  const driverIcon = new L.Icon({
    iconUrl: "/driver.png", // Use a different icon for the driver
    iconSize: [40, 50],
  });

  useEffect(() => {
    const fetchDriverTrips = async () => {
      try {
        const driverId = localStorage.getItem("userId");
        if (!driverId) {
          console.error("Driver ID not found");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/trips/driver/${driverId}`
        );

        if (response.data.trips.length === 0) {
          console.warn("No trips found for the driver.");
          return;
        }

        setTrips(response.data.trips);

        // Fetch route for each trip
        response.data.trips.forEach((trip) => {
          handleSearchRoute(trip._id, trip.source, trip.destinations);
        });
      } catch (error) {
        console.error("Failed to fetch driver trips", error);
      }
    };

    fetchDriverTrips();
  }, []);

  useEffect(() => {
    // Track driver's real-time location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const geocodeLocation = async (location) => {
    try {
      if (!location) throw new Error("Invalid location");

      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );

      if (data.length === 0) {
        console.warn(`Location "${location}" not found.`);
        return null;
      }

      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleSearchRoute = async (tripId, source, destinations) => {
    if (!source || destinations.length === 0) {
      setStatusMessages((prev) => ({
        ...prev,
        [tripId]: "Please enter a valid source and at least one destination.",
      }));
      return;
    }

    try {
      const sourceCoords = await geocodeLocation(source);
      const destinationCoords = await Promise.all(
        destinations.map((d) => geocodeLocation(d))
      );

      const validDestinations = destinationCoords.filter((d) => d !== null);

      if (!sourceCoords || validDestinations.length === 0) {
        setStatusMessages((prev) => ({
          ...prev,
          [tripId]: "Geocoding failed. Please check the locations.",
        }));
        return;
      }

      const allLocations = [sourceCoords, ...validDestinations];
      setTripLocations((prev) => ({
        ...prev,
        [tripId]: allLocations,
      }));

      const coordinates = allLocations
        .map((loc) => `${loc.lng},${loc.lat}`)
        .join(";");

      const osrmResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      const { routes } = osrmResponse.data;
      if (routes.length === 0) {
        setStatusMessages((prev) => ({
          ...prev,
          [tripId]: "No route found.",
        }));
        return;
      }

      const roadRoute = routes[0].geometry.coordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));

      setTripRoutes((prev) => ({
        ...prev,
        [tripId]: roadRoute,
      }));

      setStatusMessages((prev) => ({
        ...prev,
        [tripId]: "Optimized route created successfully!",
      }));
    } catch (error) {
      console.error("Failed to create route:", error);
      setStatusMessages((prev) => ({
        ...prev,
        [tripId]: "Failed to create route. Please check the locations and try again.",
      }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <div className="mt-4">
        {trips.length === 0 ? (
          <p>No trips assigned.</p>
        ) : (
          trips.map((trip) => (
            <div
              key={trip._id}
              className="p-4 mb-4 bg-gray-100 rounded shadow text-black"
            >
              <h2 className="font-bold">Bus ID: {trip.busId}</h2>
              <p>Status: {trip.status}</p>
              <p>Source: {trip.source}</p>
              <p>Destinations: {trip.destinations.join(", ")}</p>

              {tripLocations[trip._id] && tripLocations[trip._id].length > 0 && (
                <MapContainer
                  center={tripLocations[trip._id][0]}
                  zoom={12}
                  style={{ height: "500px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {tripLocations[trip._id].map((loc, index) => (
                    <Marker key={index} position={loc} icon={markerIcon}>
                      <Popup>
                        {index === 0 ? "Source" : `Destination ${index}`}
                      </Popup>
                    </Marker>
                  ))}

                  {tripRoutes[trip._id] && (
                    <Polyline positions={tripRoutes[trip._id]} color="blue" />
                  )}

                  {/* Driver's real-time location */}
                  {driverLocation && (
                    <Marker position={driverLocation} icon={driverIcon}>
                      <Popup>Driver's Current Location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
              <p className="text-red-500">{statusMessages[trip._id]}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
