//   Create  ->  POST    /api/events         createEvent
//   Read    ->  GET     /api/events         getEvents   (all, optional ?zipcode=)
//               GET     /api/events/mine    getMyEvents (only mine)
//               GET     /api/events/:id     getEvent    (one)
//   Update  ->  PUT     /api/events/:id      replaceEvent (send every field)
//               PATCH   /api/events/:id      updateEvent  (send only changed fields)
//   Delete  ->  DELETE  /api/events/:id      deleteEvent

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

//In-memory Caching
// Simple in-memory cache
const cache = {
  events: {},
  myEvents: null,
  guestEvents: null,
  participatingEvents: {}, //Keyed by id
  eventDetails: {}, // keyed by id
  lastFetch: {}, // track when each was fetched
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(key) {
  return (
    cache.lastFetch[key] && Date.now() - cache.lastFetch[key] < CACHE_DURATION
  );
}

function clearCache() {
  cache.events = {};
  cache.myEvents = null;
  cache.guestEvents = null;
  cache.participatingEvents = null;
  cache.eventDetails = {};
  cache.lastFetch = {};
}

export async function getEvents(zipcode, latitude, longitude) {
  // Generate unique cache key for each combination
  let cacheKey = "events_all";
  
  if (zipcode) {
    cacheKey = `events_zip_${zipcode}`;
  } else if (latitude && longitude) {
    cacheKey = `events_loc_${latitude}_${longitude}`;
  }

  // Check cache
  if (cache.events[cacheKey] && isCacheValid(cacheKey)) {
    console.log("events cache Hit")
    return cache.events[cacheKey];
  }

  const data = await fetchEvents(zipcode, latitude, longitude);
  cache.events[cacheKey] = data;
  cache.lastFetch[cacheKey] = Date.now();
  return data;
}

async function fetchEvents(zipcode, latitude, longitude) {
  const query = new URLSearchParams();
  if (zipcode) query.append("zipcode", encodeURIComponent(zipcode));
  if (latitude) query.append("latitude", latitude);
  if (longitude) query.append("longitude", longitude);

  const queryString = query.toString();
  const res = await fetch(
    `${BASE_URL}/api/events${queryString ? "?" + queryString : ""}`,
    {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load events (${res.status})`);
  }

  return res.json();
}

// READ MINE — GET /api/events/mine. Only events created by the logged-in user.
export async function getMyEvents() {
  if (cache.myEvents && isCacheValid("myEvents")) {
    return cache.myEvents;
  }

  const res = await fetch(`${BASE_URL}/api/events/mine`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }
  const data = await res.json();
  cache.myEvents = data;
  cache.lastFetch.myEvents = Date.now();
  return data;
}

export async function getGuestEvents(id) {
  // getGuestEvents (by id)
  if (cache.guestEvents[id] && isCacheValid(`guestEvents_${id}`)) {
    return cache.guestEvents[id];
  }

  const res = await fetch(`${BASE_URL}/api/events/guest/${id}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }
  const data = await res.json();
  cache.guestEvents[id] = data;
  cache.lastFetch[`guestEvents_${id}`] = Date.now();
  return data;
}

//READ EVENTS PARTICIPATING- Get /api/events/participating. only evets a user is pariticipating in
export async function getEventsParticipating() {
  // getEventsParticipating
  if (cache.participatingEvents && isCacheValid("participatingEvents")) {
    return cache.participatingEvents;
  }

  const res = await fetch(`${BASE_URL}/api/events/participating`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }
  const data = await res.json();
  cache.participatingEvents = data;
  cache.lastFetch.participatingEvents = Date.now();
  return data;
}

// READ ONE — GET /api/events/:id. Returns a single event, or throws on 404.
export async function getEvent(id) {
  // getEvent (by id)
  if (cache.eventDetails[id] && isCacheValid(`event_${id}`)) {
    return cache.eventDetails[id];
  }

  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load event ${id} (${res.status})`);
  }
  const data = await res.json();
  cache.eventDetails[id] = data;
  cache.lastFetch[`event_${id}`] = Date.now();
  return data;
}

// CREATE — POST /api/events. Backend fills in creator_id from the auth token.
// data = { name, description?, category, time, address, zipcode, facilities_id }
export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/api/events`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not create event (${res.status})`);
  }

  clearCache();
  return res.json();
}

// REPLACE — PUT /api/events/:id. Sends the whole record; missing fields error out.
// data = { name, description, category, time, address, zipcode, facilities_id }
export async function replaceEvent(id, data) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not update event ${id} (${res.status})`,
    );
  }

  clearCache();
  return res.json();
}

// UPDATE (partial) — PATCH /api/events/:id. Only the fields you send get changed.
export async function updateEvent(id, data) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not update event ${id} (${res.status})`,
    );
  }

  clearCache();
  return res.json();
}

// DELETE — DELETE /api/events/:id. Backend replies 204, so no res.json() here.
export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not delete event ${id} (${res.status})`,
    );
  }

  clearCache();
  return null;
}
