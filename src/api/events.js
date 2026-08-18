
//   Create  ->  POST    /api/events         createEvent
//   Read    ->  GET     /api/events         getEvents   (all, optional ?zipcode=)
//               GET     /api/events/mine    getMyEvents (only mine)
//               GET     /api/events/:id     getEvent    (one)
//   Update  ->  PUT     /api/events/:id      replaceEvent (send every field)
//               PATCH   /api/events/:id      updateEvent  (send only changed fields)
//   Delete  ->  DELETE  /api/events/:id      deleteEvent

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// READ ALL — GET /api/events. zipcode is optional; pass it to filter server-side.
export async function getEvents(zipcode) {
  const query = zipcode ? `?zipcode=${encodeURIComponent(zipcode)}` : '';
  const res = await fetch(`${BASE_URL}/api/events${query}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load events (${res.status})`);
  }

  return res.json();
}

// READ MINE — GET /api/events/mine. Only events created by the logged-in user.
export async function getMyEvents() {
  const res = await fetch(`${BASE_URL}/api/events/mine`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }

  return res.json();
}

export async function getGuestEvents(id) {
  const res = await fetch(`${BASE_URL}/api/events/guest/${id}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }

  return res.json();
}

//READ EVENTS PARTICIPATING- Get /api/events/participating. only evets a user is pariticipating in
export async function getEventsParticipating() {
  const res = await fetch(`${BASE_URL}/api/events/participating`,{
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load your events (${res.status})`);
  }

  return res.json();
}

// READ ONE — GET /api/events/:id. Returns a single event, or throws on 404.
export async function getEvent(id) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load event ${id} (${res.status})`);
  }

  return res.json();
}

// CREATE — POST /api/events. Backend fills in creator_id from the auth token.
// data = { name, description?, category, time, address, zipcode, facilities_id }
export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not create event (${res.status})`);
  }

  return res.json();
}

// REPLACE — PUT /api/events/:id. Sends the whole record; missing fields error out.
// data = { name, description, category, time, address, zipcode, facilities_id }
export async function replaceEvent(id, data) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not update event ${id} (${res.status})`);
  }

  return res.json();
}

// UPDATE (partial) — PATCH /api/events/:id. Only the fields you send get changed.
export async function updateEvent(id, data) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not update event ${id} (${res.status})`);
  }

  return res.json();
}

// DELETE — DELETE /api/events/:id. Backend replies 204, so no res.json() here.
export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not delete event ${id} (${res.status})`);
  }

  return null;
}