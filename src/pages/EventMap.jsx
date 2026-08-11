import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getEvents } from '../api/events'; 

// --- ESSENTIAL VITE FIX FOR LEAFLET ICONS ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
// ---------------------------------------------

// MATHEMATICAL FORMULA TO CALCULATE DISTANCE IN MILES
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =========================================================================
// CRASH-PROOF AUTO-ZOOM COMPONENT
// =========================================================================
function MapBounds({ center, radiusInMeters }) {
  const map = useMap();

  useEffect(() => {
    // Make sure we have valid coordinates and a radius before doing math
    if (center && center.length === 2 && radiusInMeters > 0) {
      try {
        // Safely calculate the geographical bounds mathematically without touching the screen
        // We multiply by 2 because toBounds expects the diameter, not the radius
        const bounds = L.latLng(center[0], center[1]).toBounds(radiusInMeters * 2);
        
        // Fly to the new bounds
        map.fitBounds(bounds, { animate: true, padding: [40, 40] });
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [map, center, radiusInMeters]);

  return null;
}
// =========================================================================

export default function MapPage() {
  const [userLocation, setUserLocation] = useState([40.7128, -74.0060]); 
  const [eventsWithCoords, setEventsWithCoords] = useState([]);
  
  // State for the custom radius input box
  const [radiusInput, setRadiusInput] = useState(""); 

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    const fetchEventsAndCoordinates = async () => {
      try {
        const realEvents = await getEvents();
        const updatedEvents = await Promise.all(
          realEvents.map(async (event) => {
            if (!event.zipcode) return event; 
            try {
              const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${event.zipcode}&country=US&format=json`);
              const data = await geoResponse.json();
              if (data && data.length > 0) {
                return { ...event, coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)] };
              }
              return event; 
            } catch (error) {
              console.error("Error fetching coordinates for event:", event.name, error);
              return event;
            }
          })
        );
        setEventsWithCoords(updatedEvents.filter(e => e.coords));
      } catch (error) {
        console.error("Error fetching events from API:", error);
      }
    };

    fetchEventsAndCoordinates();
  }, []);

  // If the input is empty, default to 5 miles. Otherwise, use what they typed.
  const activeRadius = radiusInput === "" ? 2 : Number(radiusInput);
  const isFiltering = radiusInput !== ""; 

  // Filter events based on distance
  const filteredEvents = isFiltering 
    ? eventsWithCoords.filter(event => {
        const distance = getDistanceInMiles(
          userLocation[0], userLocation[1],
          event.coords[0], event.coords[1]
        );
        return distance <= activeRadius;
      })
    : eventsWithCoords; // Show all if empty


  return (
    <div className="fixed top-25 left-0 right-0 bottom-25 z-0 overflow-hidden bg-gray-900">
      
      {/* SEARCH RADIUS BOX */}
      <div className="absolute top-4 right-4 z-1000 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-56">
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
        style={{ height: '100%', width: '100%' }}
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
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
        />

        {/* EVENT MARKERS */}
        {filteredEvents.map((event) => (
          <Marker key={event.id} position={event.coords}>
            <Popup>{event.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

    </div>
  );
}