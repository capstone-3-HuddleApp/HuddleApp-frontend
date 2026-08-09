import FormField from "./FormField";
import SelectField from "./SelectField";
import { useState } from "react";


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
