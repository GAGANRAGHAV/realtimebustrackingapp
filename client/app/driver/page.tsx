"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/trips`);
        setTrips(response.data.trips);
      } catch (error) {
        console.error("Failed to fetch trips", error);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4">
        {trips.map((trip) => (
          <div key={trip._id} className="p-4 mb-4 bg-gray-100 rounded shadow">
            <h2 className="font-bold">Bus ID: {trip.busId}</h2>
            <p>Status: {trip.status}</p>
            <p>Route: {trip.route.length} points</p>
          </div>
        ))}
      </div>
    </div>
  );
}
