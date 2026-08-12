import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
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

// MATHEMATICAL FORMULA TO CALCULATE DISTANCE IN MILES
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// CRASH-PROOF AUTO-ZOOM COMPONENT
function MapBounds({ center, radiusInMeters }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2 && radiusInMeters > 0) {
      try {
        const bounds = L.latLng(center[0], center[1]).toBounds(
          radiusInMeters * 2,
        );
        map.fitBounds(bounds, { animate: true, padding: [40, 40] });
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [map, center, radiusInMeters]);

  return null;
}

// =========================================================================
// FIXED: Moved ZoomTracker OUTSIDE of MapPage so React doesn't recreate it
// =========================================================================
function ZoomTracker({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      // Whenever the user stops pinching/scrolling, update our state
      onZoomChange(map.getZoom());
    },
  });
  return null;
}
// =========================================================================

export default function MapPage() {
  const [userLocation, setUserLocation] = useState([40.7128, -74.006]);
  const [eventsWithCoords, setEventsWithCoords] = useState([]);
  const [facilitiesWithCoords, setFacilitiesWithCoords] = useState([]);
  const [radiusInput, setRadiusInput] = useState("");

  // =========================================================================
  // FIXED: Added the missing state to remember the zoom level!
  // =========================================================================
  const [currentZoom, setCurrentZoom] = useState(11);
  // =========================================================================

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    const fetchAllDataAndCoordinates = async () => {
      try {
        const realEvents = await getEvents();
        const updatedEvents = await Promise.all(
          realEvents.map(async (event) => {
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
        setEventsWithCoords(updatedEvents.filter((e) => e.coords));
      } catch (error) {
        console.error("Error fetching events from API:", error);
      }

      try {
        const data = await searchFacilities({
          optype: ["Public"],
          facgroup: ["PARKS AND PLAZAS", "LIBRARIES"],
        });

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

  const activeRadius = radiusInput === "" ? 2 : Number(radiusInput);
  const isFiltering = radiusInput !== "";

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
    : eventsWithCoords;

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

        {/* LISTENS FOR YOU PINCHING THE MAP */}
        <ZoomTracker onZoomChange={setCurrentZoom} />

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

        {/* FACILITY MARKERS (GREEN) - Only visible when zoomed in to level 14 or closer */}
        {currentZoom >= 15 && filteredFacilities.map((facility) => (
          <Marker key={`facility-${facility.uid || facility.id}`} position={facility.coords} icon={facilityIcon}>
            <Popup>
              <strong>{facility.facname || "Public Facility"}</strong><br/>
              <em>{facility.factype || "Facility"}</em>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}