"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({ route, setRoute }) {
  const [position, setPosition] = useState<LatLngTuple>([18.52, 73.854]); // Initial position for the map

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setRoute((prev) => [...prev, { lat, lng }]);
  };

  return (
    <MapContainer
      center={position}
      zoom={10}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "400px" }}
      onClick={handleMapClick}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Add markers */}
      {route.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]}>
          <Popup>
            {index === 0
              ? "Source"
              : `Destination ${index}`}
          </Popup>
        </Marker>
      ))}
      {/* Add polyline to connect all points */}
      <Polyline
        positions={route.map((point) => [point.lat, point.lng])}
        color="blue"
      />
    </MapContainer>
  );
}
