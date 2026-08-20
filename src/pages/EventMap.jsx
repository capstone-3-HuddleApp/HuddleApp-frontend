import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
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

// Pink Icon for the User's Location
const pinkUserIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

// Tracks both Zoom AND the physical corners of the screen
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
  }, [map]); // <--- THE FIX: We removed onMapChange from this dependency array!

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState([40.7128, -74.006]);
  const [eventsWithCoords, setEventsWithCoords] = useState([]);
  const [facilitiesWithCoords, setFacilitiesWithCoords] = useState([]);
  const [radiusInput, setRadiusInput] = useState("");

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

        // Events already have latitude/longitude from your DB
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

  const visibleFacilities = filteredFacilities.filter((facility) => {
    if (!currentBounds) return false;
    return currentBounds.contains(
      L.latLng(facility.coords[0], facility.coords[1]),
    );
  });

  return (
    <div className="fixed top-25 left-0 right-0 bottom-25 z-0 overflow-hidden bg-[#fff9df] [&_.leaflet-top.leaflet-left]:top-10">
      {/* SEARCH RADIUS BOX */}
      <div className="absolute top-14 right-4 z-1000 w-56 rounded-lg border border-[#d8cdb6] bg-[#fff9df] p-3 shadow-lg">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Search Radius (Miles):
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={radiusInput}
          onChange={(e) => setRadiusInput(e.target.value)}
          className="w-full bg-[#fff9df] border border-[#d8cdb6] text-[#29272b] text-sm rounded-md focus:ring-[#f2a451] focus:border-[#f2a451] block p-2"
          placeholder="e.g. 10 (blank for all)"
        />
      </div>

      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={userLocation}
        zoom={11}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds
          center={userLocation}
          radiusInMeters={activeRadius * 1609.34}
        />

        {/* LISTENS FOR YOU PINCHING OR CLICKING THE MAP */}
        <MapStateTracker
          onMapChange={(zoom, bounds) => {
            if (zoom === "click") {
              // FIX: Clicking empty map clears everything!
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
        <Marker position={userLocation} icon={pinkUserIcon}>
          <Popup>You are here!</Popup>
        </Marker>

        <Circle
          center={userLocation}
          radius={activeRadius * 1609.34}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "red",
            fillOpacity: 0.2,
          }}
        />

        {/* EVENT MARKERS (BLUE) */}
        {filteredEvents.map((event) => (
          <Marker
            key={`event-${event.id}`}
            position={event.coords}
            eventHandlers={{
              click: () => {
                setSelectedEvent(event);
                // FIX: Clear facility selection if user clicks an event
                setSelectedFacility(null);
                sessionStorage.removeItem("prefillFacilityAddress");
              },
            }}
          />
        ))}

        {/* FACILITY MARKERS (GREEN OR RED) */}
        {currentZoom >= 15 &&
          visibleFacilities.map((facility) => {
            // FIX: Check if this facility is the active one
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
                    setSelectedEvent(null); // Hide event popup if it's open

                    // Save the address (or name) to memory for the Create Event page!
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

      {/* BOTTOM SHEET OVERLAY */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-2000 bg-white rounded-t-3xl p-5 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out ${
          selectedEvent ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {selectedEvent && (
          <div className="relative flex gap-4">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center font-bold text-xl cursor-pointer"
            >
              &times;
            </button>

            <img
              src={selectedEvent.image || "https://placehold.co/150x150/png"}
              alt={selectedEvent.name}
              className="w-28 h-28 object-cover rounded-xl shadow-sm bg-gray-100"
            />

            <div className="flex flex-col justify-between flex-1 pr-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                  {selectedEvent.name}
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {selectedEvent.time
                    ? new Date(selectedEvent.time).toLocaleDateString()
                    : "Date TBD"}
                </p>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {getDistanceInMiles(
                    userLocation[0],
                    userLocation[1],
                    selectedEvent.coords[0],
                    selectedEvent.coords[1],
                  ).toFixed(1)}{" "}
                  miles away
                </p>
              </div>

              <button
                onClick={() =>
                  (window.location.href = `/events/${selectedEvent.id}`)
                }
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-semibold transition shadow-md w-full block"
              >
                More details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
