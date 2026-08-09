import FormField from "./FormField";
import SelectField from "./SelectField";
import { useState } from "react";

/**
 * $$$-Funtion Creation: 08/09/2026, [Md Shamin Ahsan Anaph]
 * $$$-Most Recent Change: 08/09/2026, [Md Shamin Ahsan Anaph]
 * 
 * $$$-Method Description:
 *    Renders a self-contained search and filter bar for events. Allows users to search
 *    for events by name and filter by category (Sports, Arts, Education, Entertainment).
 *    Manages its own state for search input and error handling. Accepts customizable
 *    placeholders for both search and filter fields.
 * 
 * $$$-Component Using This Function:
 *    Navbar (on /chat-rooms route)
 * 
 * $$$-Description of Variables:
 *    - searchPlaceholder: Custom placeholder text for search input (default: "Search Events!")
 *    - filterPlaceholder: Custom placeholder text for category filter (default: "Filter")
 *    - value: Current search/filter input value
 *    - error: Error state for form validation
 *    - CATEGORY_OPTIONS: Array of category filter options (Sports, Arts, Education, Entertainment)
 *    - handleChange: Updates value state when user types in search or selects category
 *
 * */
export default function SearchBar({searchPlaceholder='Search Events!', filterPlaceholder='Filter'}) {
  const [error, setError] = useState(null);
  const [value, setValue] = useState("")

 const CATEGORY_OPTIONS = [
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
];

  function handleChange(e) {
    setValue(e.value)
  }

  return (
    <div className="mt-1.5 w-65 flex flex-row pr-1 pl-2 items-center-safe justify-center border-2 border-b-mauve-700 bg-mist-900 rounded-2xl">
    <FormField
    className="pb-1 mr-1 h-10"
      label=""
      name="search_events"
      value={value}
      onChange={handleChange}
      error={error}
      placeholder={searchPlaceholder}
    />
    <SelectField
    className="w-15 p-1 mb-1 h-8"
        label=""
      name="search_events"
      value={value}
      onChange={handleChange}
      error={error}
      options={CATEGORY_OPTIONS}
      placeholder={filterPlaceholder}
    />
    </div>
    
  );
}
