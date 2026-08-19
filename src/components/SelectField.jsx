// SelectField.jsx — the <select> counterpart to FormField.
//
// Same props shape as FormField (label, name, value, onChange, error) so the
// two can sit side by side in a form without the calling code needing to
// think differently about them. The one addition is `options`, since a
// select needs to know what choices to render.
//
// Accessibility wiring mirrors FormField exactly

export default function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options, // array of either strings, or { value, label } objects
  placeholder = 'Select',
  ...selectProps // required, disabled, ... pass straight through
}) {
  const errorId = `${name}-error`;

  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={name} className='text-sm font-semibold text-[#29272b]'>
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-[#fff9df]/80 px-4 py-3 text-sm text-[#29272b] outline-none transition
          focus:border-[#f2a451] focus:ring-2 focus:ring-[#f2a451]/20
          ${error ? 'border-red-500' : 'border-[#d8cdb6]'}`}
        {...selectProps}
      >
        {/* Disabled placeholder — shown until the user picks something, but
            not itself a valid submission (required blocks it from staying). */}
        <option value='' >
          {placeholder}
        </option>

        {options.map((option) => {
          // Lets callers pass plain strings ('sports') when the value and
          // display label are the same, or { value, label } when they're not
          // (e.g. value: 'sports', label: 'Sports').
          const optionValue =
            typeof option === 'string' ? option : option.value;
          const optionLabel =
            typeof option === 'string' ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>

      {error && (
        <span id={errorId} role='alert' className='text-sm text-red-500'>
          {error}
        </span>
      )}
    </div>
  );
}
