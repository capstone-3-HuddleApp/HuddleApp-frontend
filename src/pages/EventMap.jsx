import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import your custom API function!
// (Adjust the path if your api folder is located somewhere else)
import { getEvents } from "../api/events";

// --- ESSENTIAL VITE FIX FOR LEAFLET ICONS ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
// ---------------------------------------------

export default function MapPage() {
  const [userLocation, setUserLocation] = useState([40.7128, -74.006]); // Defaults to NYC
  const [eventsWithCoords, setEventsWithCoords] = useState([]);

  useEffect(() => {
    // 1. Get User Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    // Fetching the Data & Geocoding from database
    const fetchEventsAndCoordinates = async () => {
      try {
        // Use your frontend API file to securely fetch the data
        const realEvents = await getEvents();

        // Convert their zipcodes to coordinates
        const updatedEvents = await Promise.all(
          realEvents.map(async (event) => {
            // Using event.zipcode to match your Sequelize model exactly
            if (!event.zipcode) return event;

            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?postalcode=${event.zipcode}&country=US&format=json`,
              );
              const data = await geoResponse.json();

              if (data && data.length > 0) {
                return {
                  ...event,
                  coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
                };
              }
              return event;
            } catch (error) {
              console.error(
                "Error fetching coordinates for event:",
                event.name,
                error,
              );
              return event;
            }
          }),
        );

        // Save the successfully mapped events to state
        setEventsWithCoords(updatedEvents.filter((e) => e.coords));
      } catch (error) {
        console.error("Error fetching events from API:", error);
      }
    };

    fetchEventsAndCoordinates();
  }, []);

  // Rendering the Map Layout
  return (
    // 1. Removed max-w-md, pl-4, and pr-4 so it stretches completely side-to-side
    <div className="h-[calc(100vh-80px)] w-full">
      {/* 2. Removed the border-2 and rounded-md so the map sits flush with the screen edges */}
      <div className="h-full w-full relative z-0">
        {/* 3. Changed h-screen back to style={{height: '100%'}} so it fits perfectly in the remaining space without scrolling */}
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          key={userLocation.toString()}
          center={userLocation}
          zoom={11}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Marker */}
          <Marker position={userLocation}>
            <Popup>You are here!</Popup>
          </Marker>

          {/* Event Markers */}
          {eventsWithCoords.map((event) => (
            // Using event.id from the database
            <Marker key={event.id} position={event.coords}>
              <Popup>{event.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
