// FormField.jsx — one labelled input, plus its error message.
//
// The Login and Signup forms need this exact trio (label, input, error text)
// six times between them. Pulling it into one component means the styling and
// the accessibility wiring are written ONCE.
//
// The accessibility wiring, since it's easy to skip:
//   htmlFor + id      — clicking the label focuses the input.
//   aria-invalid      — tells a screen reader this field is wrong, not just red.
//   aria-describedby  — points the screen reader at the error text, so the user
//                       hears WHAT is wrong, not only that something is.
export default function FormField({
  className = "",
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  ...inputProps // placeholder, autoComplete, required, ... pass straight through
}) {
  const errorId = `${name}-error`;

  return (
    <div className={`${className} flex flex-col gap-1.5`}>
      {/* made the form label slightly more bold and gave them a softer color */}
      <label htmlFor={name} className="text-sm font-semibold text-[#29272b]">
        {label}
      </label>
      {/* Changed className to give each input a dark translucent background, a purple focus state, makes placeholder text new color to fit style, larger corners, more padding, and white typed text */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border h-full bg-[#fff9df]/80 px-4 py-3 text-sm text-[#29272b] text-wrap placeholder:text-[#7d8794] outline-none transition
          focus:border-[#f2a451] focus:ring-2 focus:ring-[#f2a451]/20
          ${error ? "border-red-500" : "border-[#d8cdb6]"}`}
        {...inputProps}
      />

      {/* role="alert" makes a screen reader announce the message the moment it appears. */}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
