// Unlike tasks/events, this resource has no CRUD — it's a single read-only
// lookup that happens to use POST (the NYC Open Data API it proxies to
// requires POST for querying, per the backend route's comment).
//
//   Search  ->  POST  /api/facilities   searchFacilities
//               body: { optype?, facgroup?, facsubgrp?, search? } — all optional

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const cache = {
  facilities: {}, // keyed by stringified params (search excluded)
  lastFetch: {},
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getParamKey(params) {
  // Exclude 'search' from the cache key
  const { search, ...filterParams } = params;
  return JSON.stringify(filterParams);
}

function isCacheValid(key) {
  return (
    cache.lastFetch[key] && Date.now() - cache.lastFetch[key] < CACHE_DURATION
  );
}

// SEARCH — POST /api/facilities. Every field is optional; send only the ones
// relevant to the current query
// params = { optype={Public}, facgroup={parks and plazas, libraries }, facsubgrp?, search? }
export async function searchFacilities(params = {}) {
  const paramKey = getParamKey(params);

  if (cache.facilities[paramKey] && isCacheValid(paramKey)) {
    return cache.facilities[paramKey];
  }

  const res = await fetch(`${BASE_URL}/api/facilities`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load facilities (${res.status})`);
  }
  const data = await res.json();
  cache.facilities[paramKey] = data;
  cache.lastFetch[paramKey] = Date.now();
  return data;
}
