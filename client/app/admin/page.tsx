"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

export default function DriverDashboard() {
  const [source, setSource] = useState(""); // Source input
  const [destinations, setDestinations] = useState([]); // Destinations input
  const [route, setRoute] = useState([]); // Array of points for the map
  const [busId, setBusId] = useState(""); // Bus ID input
  const [status, setStatus] = useState("");
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [drivers, setDrivers] = useState([]); // State to store drivers
  const [selectedDriver, setSelectedDriver] = useState(""); // Selected driver
  // console.log(selectedDriver);
  
  
  
  const markerIcon = new L.Icon({
    iconUrl: "/marker.png", // Static file path from the public folder
    iconSize: [35, 45], // Adjust size as needed
  });

  // Function to handle geocoding
  const geocodeLocation = async (location) => {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
    );
    if (data.length === 0) throw new Error(`Location "${location}" not found`);
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  };

  // Handle source and destination submission
  const calculateDistance = (point1, point2) => {
    const toRad = (angle) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortDestinations = (source, destinations) => {
    const sorted = [];
    let currentLocation = source;
    let remaining = [...destinations];

    while (remaining.length > 0) {
      remaining.sort(
        (a, b) =>
          calculateDistance(currentLocation, a) -
          calculateDistance(currentLocation, b)
      );
      let nearest = remaining.shift(); // Pick the closest destination
      sorted.push(nearest);
      currentLocation = nearest; // Move to next destination
    }

    return sorted;
  };

console.log(destinations);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/trips/drivers");
        setDrivers(response.data.drivers);
        console.log(response.data.drivers);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
      }
    };
    fetchDrivers();
  }, []);

  const handleSearchRoute = async () => {
    if (!source || destinations.length === 0) {
      setStatus("Please enter a source and at least one destination.");
      return;
    }

    try {
      // Convert source and destinations into geocoordinates
      const sourceCoords = await geocodeLocation(source);
      const destinationCoords = await Promise.all(
        destinations.map((d) => geocodeLocation(d))
      );

      // Sort destinations based on nearest neighbor heuristic
      const sortedDestinations = sortDestinations(
        sourceCoords,
        destinationCoords
      );

      // Prepare full sorted route: [source -> sorted destinations]
      const allLocations = [sourceCoords, ...sortedDestinations];
      setGeocodedLocations(allLocations);

      // Prepare coordinates for OSRM routing
      const coordinates = allLocations
        .map((loc) => `${loc.lng},${loc.lat}`)
        .join(";");

      // Fetch the optimized route from OSRM
      const osrmResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      const { routes } = osrmResponse.data;
      if (routes.length === 0) {
        setStatus("No route found.");
        return;
      }

      const roadRoute = routes[0].geometry.coordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));

      setRoute(roadRoute);
      setStatus("Optimized route created successfully!");
    } catch (error) {
      console.error("Failed to create route:", error);
      setStatus(
        "Failed to create route. Please check the locations and try again."
      );
    }
  };

  const startTrip = async () => {
    if (route.length < 2) {
      setStatus("Please create a valid route before starting the trip.");
      return;
    }

    const payload = {
      driverdetails: selectedDriver,
      busId,
      source,
      destinations,
    };
    console.log("trip payload:", payload);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/trips`,
        { driverdetails: selectedDriver,busId ,source, destinations },
      );
      setStatus("Trip started successfully!");
    } catch (error) {
      console.error("Failed to start trip", error);
      setStatus("Failed to start trip. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <input
        type="text"
        placeholder="Bus ID"
        className="w-full mb-4 p-2 border rounded"
        value={busId}
        onChange={(e) => setBusId(e.target.value)}
      />

<select
        className="w-full mb-4 p-2 border rounded"
        value={selectedDriver}
        onChange={(e) => setSelectedDriver(e.target.value)}
      >
        <option value="">Select a Driver</option>
        {drivers.map((driver) => (
          <option key={driver._id} value={driver._id}>
            {driver.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Source"
        className="w-full mb-4 p-2 border rounded"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />

      <textarea
        placeholder="Enter destinations (comma separated)"
        className="w-full mb-4 p-2 border rounded"
        rows={3}
        value={destinations.join(", ")}
        onChange={(e) =>
          setDestinations(e.target.value.split(",").map((d) => d.trim()))
        }
      />

      <button
        onClick={handleSearchRoute}
        className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Search and Create Route
      </button>

      <MapContainer
        center={[18.52, 73.854]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "400px", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route.length > 0 && (
          <>
            {/* Markers for only the source and destinations */}
            {geocodedLocations.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={markerIcon}
              >
                <Popup>{index === 0 ? "Source" : `Destination ${index}`}</Popup>
              </Marker>
            ))}

            {/* Polyline for the route */}
            <Polyline
              positions={route.map((point) => [point.lat, point.lng])}
              color="blue"
            />
          </>
        )}
      </MapContainer>

      <button
        onClick={startTrip}
        className="w-full mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Start Trip
      </button>

      {status && (
        <p
          className={`mt-4 ${
            status.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
