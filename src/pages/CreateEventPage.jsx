// CreateEventPage.jsx — the form for POST /api/events.
//
// One FormField per field the backend expects. `formData` and `errors` are
// each a single object keyed by field name, so one onChange handler and one
// validate function cover all seven fields instead of one state pair per field.
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import FormField from "../components/FormField";
import SelectField from "../components/SelectField";
import { createEvent } from "../api/events";
import { searchFacilities } from "../api/facilities";

// Fields the backend requires (facilities_id included) — everything except
// description. Checked client-side before we ever hit the network, so the
// user sees which fields are missing instead of waiting on a 400.
const REQUIRED_FIELDS = [
  "name",
  "category",
  "time",
  "address",
  "location",
  "zipcode",
  "facilities_id",
];

// { value, label } pairs: value is what's sent to the backend (lowercase,
// matches what the API expects), label is what the user sees (capitalized).
const CATEGORY_OPTIONS = [
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
];

//maps the events category to the facgroup used to filter facility search
//
const CATEGORY_TO_FACGROUP = {
  sports: ["PARKS AND PLAZAS"],
  arts: ["PARKS AND PLAZAS", "LIBRARIES"],
  education: ["LIBRARIES"],
  entertainment: ["LIBRARIES", "PARKS AND PLAZAS"],
};

const min_search_len = 4;
const Debounce_ms = 500;

function toDateTimeLocal(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16); //drom seconds + "Z"
}

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    time: toDateTimeLocal(new Date()),
    location: "",
    address: "",
    zipcode: "",
    maxParticipants: 99999,
    facilities_id: "",
  });

  // Per-field validation messages, shown by each FormField's own error prop.
  const [errors, setErrors] = useState({});

  // Errors that aren't about one specific field (network failure, server
  // rejection) go here instead — shown once, above the form.
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results from the last successful search, shown as a dropdown under the
  // address field. Empty array = no dropdown rendered.
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Location that's currently backed by a real facility selection. Used to
  // skip re-searching immediately after a user picks a suggestion — without
  // this, setting formData.location on selection would re-trigger the same
  // debounced search a moment later for no reason.
  const selectedLocationRef = useRef("");

  // Guards against a slow earlier request overwriting a faster later one.
  // Each search call gets an id; a response is only applied if its id still
  // matches the most recent request fired.
  const searchRequestIdRef = useRef(0);

  // One handler for every field: e.target.name tells us which key to update.
  // This is why every <FormField> below needs a matching `name` prop.
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Typing in the address after a facility was already selected means
      // that selection may no longer be valid — clear it so the user can't
      // accidentally submit a facilities_id that doesn't match what's typed.
      if (name === "location" && value !== selectedLocationRef.current) {
        next.facilities_id = ""
      }

      return next;
    });
  }

  // Debounced facility search — re-runs whenever the address or category
  // changes. The returned cleanup function is what makes this a *debounce*:
  // every keystroke cancels the previous pending timer before it can fire,
  // so a request only actually goes out once typing pauses for DEBOUNCE_MS.
  useEffect(() => {
    const location = formData.location.trim();

    // Nothing worth searching for, or the address is exactly what a
    // suggestion selection just set — skip without touching loading state.
    if (
      location.length < min_search_len ||
      location === selectedLocationRef.current
    ) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++searchRequestIdRef.current;
      setIsSearching(true);
      setSearchError("");

      console.log(location)

      try {
        const facgroup = CATEGORY_TO_FACGROUP[formData.category];
        const { records } = await searchFacilities({
          search: location,
          optype: "Public", // always public, per requirements
          ...(facgroup ? { facgroup } : {}),
        });

        // A newer request may have started (and even finished) while this
        // one was in flight. If so, drop this result — it's for stale input.
        if (requestId !== searchRequestIdRef.current) return;

        setSuggestions(records);
      } catch (err) {
        if (requestId !== searchRequestIdRef.current) return;
        setSearchError(err.message);
        setSuggestions([]);
      } finally {
        if (requestId === searchRequestIdRef.current) setIsSearching(false);
      }
    }, Debounce_ms);

    // Cleanup runs before the *next* effect call (i.e. on every keystroke)
    // and on unmount — canceling the pending timer is the actual debounce.
    return () => clearTimeout(timer);
  }, [formData.category, formData.location]);

  // Called when the user clicks a suggestion from the dropdown. Fills in
  // every field the facility record can supply, and marks this address as
  // "already resolved" so the effect above doesn't immediately re-search it.
  function handleSelectFacility(facility) {
    selectedLocationRef.current = facility.facname;

    setFormData((prev) => ({
      ...prev,
      location: facility.facname,
      address: facility.address,
      zipcode: facility.zipcode,
      facilities_id: facility.uid,
    }));
    setSuggestions([]);
  }

  // AUTOMATIC MAP PREFILL LOGIC
  // Checks memory when the page loads. If a facility was clicked on the map, 
  // it parses the object and instantly fills the form!
  // Added By Talha - 08/13/26
  // =========================================================================
  useEffect(() => {
    const saved = sessionStorage.getItem("prefillFacility");
    if (saved) {
      try {
        const facility = JSON.parse(saved);
        handleSelectFacility(facility);
      } catch (e) {
        console.error("Failed to parse prefilled facility from map", e);
      } finally {
        // Clear it from memory so it doesn't auto-fill again if the user refreshes
        sessionStorage.removeItem("prefillFacility");
      }
    }
  }, []);

  // Returns an errors object; empty object means the form is valid.
  function validate() {
    const nextErrors = {};
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    }
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // description is optional — send undefined instead of '' so the
      // backend's `if (!name || ...)` style checks don't see an empty string
      // as "provided but blank."
      const event = await createEvent({
        ...formData,
        description: formData.description.trim() || undefined,
      });
      navigate(`/events/${event.id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-white">Create an event</h1>

      {submitError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
        >
          {submitError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-5 border-2 rounded-3xl"
      >
        <FormField
          label="Event name*"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <span className="flex flex-row gap-1">
          <SelectField
            label="Category*"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={CATEGORY_OPTIONS}
            required
          />

          {/* datetime-local gives a native date+time picker and submits a
            string like "2026-08-07T18:30" — adjust if your backend expects
            a different time format. */}
          <FormField
            label="Date & time*"
            name="time"
            type="datetime-local"
            value={formData.time}
            onChange={handleChange}
            error={errors.time}
            required
          />
        </span>

        {/* relative wrapper is what lets the suggestions dropdown float
            under the address field instead of pushing the layout down. */}
        <div className="relative">
          <FormField
            label="Location*"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder = "Search location"
            required
          />
          {isSearching && (
            <p className="mt-1 text-xs text-[#777087]">Searching…</p>
          )}

          {searchError && (
            <p role="alert" className="mt-1 text-xs text-red-500">
              {searchError}
            </p>
          )}

          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full h-60 overflow-y-scroll rounded-xl border border-white/10 bg-[#17141f] shadow-lg">
              {suggestions.map((facility) => (
                <li key={facility.uid}>
                  <button
                    type="button"
                    onClick={() => handleSelectFacility(facility)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-violet-500/20"
                  >
                    <span className="block font-semibold">
                      {facility.facname}
                    </span>
                    <span className="block text-xs text-[#777087]">
                      {facility.address}, {facility.city}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>


        <span className="flex flex-row gap-1 items-start w-full">
          <FormField
            label="Address*"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            autoComplete="off"
            required
          />

          <FormField
            className="w-[30%]"
            label="Zip code*"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            error={errors.zipcode}
            required
          />
        </span>

        <FormField
          className="h-25"
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <FormField
            className="w-[60%]"
            label="Max Participants (optional)"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            error={errors.maxParticipants}
            required
          />

        {/* facilities hidden, auto filled up when user chooses a location*/}
        <FormField
          className="hidden"
          label="Facility ID"
          name="facilities_id"
          value={formData.facilities_id}
          onChange={handleChange}
          error={errors.facilities_id}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create event"}
        </button>
      </form>
    </div>
  );
}
