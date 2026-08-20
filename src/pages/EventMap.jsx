
import React, { useState, useEffect, useRef } from "react";
import EventBottomSheet from "../components/mapComponents/EventBottomSheet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router";
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

// Animated Pink Icon for the User's Location (Bouncing Pin + Pulsing Radar)
const animatedUserIcon = new L.divIcon({
  // Clear out Leaflet's default white box styling
  className: "bg-transparent border-none",
  html: `
    <div class="relative flex flex-col items-center justify-end w-12.5 h-17.5">
      
      <!-- The bouncing pin -->
      <img 
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" 
        class="relative z-10 w-6.25 h-10.25 animate-bounce" 
        style="animation-duration: 1.2s;"
      />
      
      <!-- The pulsing radar circle on the ground -->
      <div class="absolute bottom-2 w-6 h-6 bg-fuchsia-500 rounded-full animate-ping opacity-75"></div>
      
      <!-- Static tiny shadow so it looks like it's floating -->
      <div class="absolute bottom-1 w-4 h-1 bg-black/40 rounded-[100%] blur-[1px]"></div>
      
    </div>
  `,
  iconSize: [50, 70],
  iconAnchor: [25, 65], // Anchors the bottom of the shadow to your true coordinate
  popupAnchor: [0, -60],
});

// Green Icon for the facilities
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

// Red Icon for selected facility
const redFacilityIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
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

// Tracks both Zoom AND the physical corners of the screen
function MapStateTracker({ onMapChange }) {
  const map = useMapEvents({
    moveend: () => {
      onMapChange(map.getZoom(), map.getBounds());
    },
    zoomend: () => {
      onMapChange(map.getZoom(), map.getBounds());
    },
    click: () => {
      onMapChange("click");
    },
  });

  // Set the initial bounds as soon as the map loads
  useEffect(() => {
    onMapChange(map.getZoom(), map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); 

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null); // <--- NEW: Gives us direct control of the camera

  const [userLocation, setUserLocation] = useState([40.7128, -74.006]);
  const [eventsWithCoords, setEventsWithCoords] = useState([]);
  const [facilitiesWithCoords, setFacilitiesWithCoords] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(11);
  const [currentBounds, setCurrentBounds] = useState(null);

  // States to remember what was clicked
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    const fetchAllDataAndCoordinates = async () => {
      try {
        const [userLatitude, userLongitude] = userLocation || [];
        const realEvents = await getEvents(null, userLatitude, userLongitude);

        const eventsWithCoords = realEvents
          .filter((e) => e.latitude && e.longitude)
          .map((event) => ({
            ...event,
            coords: [parseFloat(event.latitude), parseFloat(event.longitude)],
          }));

        setEventsWithCoords(eventsWithCoords);
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

  const visibleFacilities = facilitiesWithCoords.filter((facility) => {
    if (!currentBounds) return false;
    return currentBounds.contains(
      L.latLng(facility.coords[0], facility.coords[1]),
    );
  });

  return (
    <div className="fixed top-25 left-0 right-0 bottom-25 z-0 overflow-hidden bg-[#fff9df] [&_.leaflet-top.leaflet-left]:top-16">
      
      {/* THE NEW FLOATING TOGGLE BUTTONS (ACTS AS LEGEND & AUTO-ZOOM) */}
      <div className="absolute top-4 left-0 right-0 z-1000 flex justify-center gap-3 pointer-events-none px-4">
        <button
          onClick={() => {
            if (mapRef.current) {
              // Swoops out to level 12 to show all events
              mapRef.current.flyTo(userLocation, 12, { animate: true });
            }
          }}
          className="pointer-events-auto flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition"
        >
          🔵 Events
        </button>

        <button
          onClick={() => {
            if (mapRef.current) {
              // Swoops in to level 15 to automatically reveal green facilities
              mapRef.current.flyTo(userLocation, 15, { animate: true });
            }
          }}
          className="pointer-events-auto flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm border-2 border-green-500 text-green-600 hover:bg-green-50 transition"
        >
          🌳 Facilities
        </button>
      </div>

      <MapContainer
        ref={mapRef} // <--- NEW: Attaches our controller to the map
        style={{ height: "100%", width: "100%" }}
        center={userLocation}
        zoom={11}
        zoomControl={false} // Clean up default zoom controls to let our buttons shine
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* LISTENS FOR YOU PINCHING OR CLICKING THE MAP */}
        <MapStateTracker
          onMapChange={(zoom, bounds) => {
            if (zoom === "click") {
              setSelectedEvent(null);
              setSelectedFacility(null);
              sessionStorage.removeItem("prefillFacilityAddress");
            } else {
              setCurrentZoom(zoom);
              setCurrentBounds(bounds);
            }
          }}
        />

        {/* USER LOCATION */}
        <Marker position={userLocation} icon={animatedUserIcon}>
          <Popup>You are here!</Popup>
        </Marker>

        {/* EVENT MARKERS (BLUE) */}
        {eventsWithCoords.map((event) => (
          <Marker
            key={`event-${event.id}`}
            position={event.coords}
            eventHandlers={{
              click: () => {
                setSelectedEvent(event);
                setSelectedFacility(null);
                sessionStorage.removeItem("prefillFacilityAddress");
              },
            }}
          />
        ))}

        {/* FACILITY MARKERS (GREEN OR RED) */}
        {currentZoom >= 15 &&
          visibleFacilities.map((facility) => {
            const isSelected =
              selectedFacility &&
              (selectedFacility.uid || selectedFacility.id) ===
                (facility.uid || facility.id);

            return (
              <Marker
                key={`facility-${facility.uid || facility.id}`}
                position={facility.coords}
                icon={isSelected ? redFacilityIcon : facilityIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedFacility(facility);
                    setSelectedEvent(null);

                    const addressToSave =
                      facility.address || facility.facname || "";
                    sessionStorage.setItem(
                      "prefillFacility",
                      JSON.stringify(facility),
                    );
                  },
                }}
              >
                <Popup>
                  <strong>{facility.facname || "Public Facility"}</strong>
                  <br />
                  <em>{facility.factype || "Facility"}</em>
                  <br />
                  <span className="text-xs text-gray-500 block mt-1">
                    (Selected! Click "+" to create event here)
                  </span>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      <EventBottomSheet
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        userLocation={userLocation}
        getDistanceInMiles={getDistanceInMiles}
      />
    </div>
  );
}