import FormField from "./FormField";
import SelectField from "./SelectField";
import { useState } from "react";
import searchIcon from "../assets/interface_icons/search.svg";

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
export default function SearchBar({searchPlaceholder='Search Events!', filterPlaceholder='Filter', selectedCategory, setSelectedCategory}) {
  const [error, setError] = useState(null);
  const [value, setValue] = useState("")

 const CATEGORY_OPTIONS = [
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
];

  function handleChange(e) {
    setValue(e.target.value)
  }

  function handleCategoryChange(e) {
    setSelectedCategory(e.target.value);
  }

  return (
    <div className="flex min-h-11 w-full max-w-md items-center gap-2 rounded-full border border-[#d8cdb6] bg-[#fff9df]/70 px-4 focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/20 [&_label]:sr-only">
    {/* Decorative search icon for the search input */}
    <img
      src={searchIcon}
      alt=""
      aria-hidden="true"
      className="size-4 shrink-0 invert opacity-60"
    />
    <FormField
      className="h-10 min-w-0 flex-1 [&_label]:sr-only [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input:focus]:ring-0"
      label=""
      aria-label={searchPlaceholder}
      name="search_events"
      value={value}
      onChange={handleChange}
      error={error}
      placeholder={searchPlaceholder}
    />
    <SelectField
      className="h-8 w-28 shrink-0 text-center appearance-none cursor-pointer rounded-full border border-[#d8cdb6] bg-[#ffe991] px-1 text-xs font-semibold text-[#29272b] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) [&_option]:bg-[#fff9df] [&_option]:text-[#29272b]"
      label=""
      aria-label={filterPlaceholder}
      name="category_filter"
      value={selectedCategory}
      onChange={handleCategoryChange}
      error={error}
      options={CATEGORY_OPTIONS}
      placeholder={filterPlaceholder}
    />
    </div>
    
  );
}
