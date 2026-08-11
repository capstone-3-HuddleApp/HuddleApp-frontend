import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getEvents } from "../api/events";
import { searchFacilities } from "../api/facilities";

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

//Icon for the facilities
const facilityIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// ---------------------------------------------

export default function MapPage() {
  const [userLocation, setUserLocation] = useState([40.7128, -74.006]); // Defaults to NYC
  const [eventsWithCoords, setEventsWithCoords] = useState([]);

  // State for the custom radius input box
  const [radiusInput, setRadiusInput] = useState("");
  const [facilitiesWithCoords, setFacilitiesWithCoords] = useState([]);

  useEffect(() => {
    // 1. Get User Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    const fetchAllDataAndCoordinates = async () => {
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

      try {
        const data = await searchFacilities({});

        const realfacilities = data.records || [];
        const updatedFacilities = realfacilities
          .map((facility) => {
            if (facility.latitude && facility.longitude) {
              return {
                ...facility,
                coords: [
                  parseFloat(facility.latitude),
                  parseFloat(facility.longitude),
                ],
              };
            }
            return null;
          })
          .filter((f) => f !== null);
        setFacilitiesWithCoords(updatedFacilities);
      } catch (error) {
        console.error("Error fetching facilities from frontend API:", error);
      }
    };

    fetchAllDataAndCoordinates();
  }, []);

  // If the input is empty, default to 5 miles. Otherwise, use what they typed.
  const activeRadius = radiusInput === "" ? 2 : Number(radiusInput);
  const isFiltering = radiusInput !== "";

  // Filter events based on distance
  const filteredEvents = isFiltering
    ? eventsWithCoords.filter((event) => {
        const distance = getDistanceInMiles(
          userLocation[0],
          userLocation[1],
          event.coords[0],
          event.coords[1],
        );
        return distance <= activeRadius;
      })
    : eventsWithCoords; // Show all if empty

  const filteredFacilities = isFiltering
    ? facilitiesWithCoords.filter((facility) => {
        const distance = getDistanceInMiles(
          userLocation[0],
          userLocation[1],
          facility.coords[0],
          facility.coords[1],
        );
        return distance <= activeRadius;
      })
    : facilitiesWithCoords;

  return (
    <div className="fixed top-25 left-0 right-0 bottom-25 z-0 overflow-hidden bg-gray-900">
      {/* SEARCH RADIUS BOX */}
      {/* Note: changed z-1000 to z-[1000] because standard Tailwind requires brackets for arbitrary values */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-56">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Search Radius (Miles):
        </label>

        <input
          type="number"
          min="0"
          step="0.1"
          value={radiusInput}
          onChange={(e) => setRadiusInput(e.target.value)}
          className="w-full bg-white border border-gray-400 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2"
          placeholder="e.g. 10 (blank for all)"
        />
      </div>

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

        {/* INVISIBLE AUTO-ZOOM MANAGER */}
        <MapBounds
          center={userLocation}
          radiusInMeters={activeRadius * 1609.34}
        />

        {/* USER LOCATION */}
        <Marker position={userLocation}>
          <Popup>You are here!</Popup>
        </Marker>

        {/* SHADED CIRCLE */}
        <Circle
          center={userLocation}
          radius={activeRadius * 1609.34}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        />

        {/* EVENT MARKERS (BLUE) */}
        {filteredEvents.map((event) => (
          <Marker key={`event-${event.id}`} position={event.coords}>
            <Popup>
              <strong>{event.name}</strong>
              <br />
              <em>Event</em>
            </Popup>
          </Marker>
        ))}

        {/* FIX 3: Render the Green Facility Markers! */}
        {filteredFacilities.map((facility) => (
          <Marker
            key={`facility-${facility.uid || facility.id}`}
            position={facility.coords}
            icon={facilityIcon}
          >
            <Popup>
              <strong>{facility.facname || "Public Facility"}</strong>
              <br />
              <em>{facility.factype || "Facility"}</em>
            </Popup>
          </Marker>
        ))}

        {/* Event Markers */}
        {eventsWithCoords.map((event) => (
          // Using event.id from the database
          <Marker key={event.id} position={event.coords}>
            <Popup>{event.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
