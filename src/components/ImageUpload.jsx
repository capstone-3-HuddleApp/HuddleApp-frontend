
export default function ImageUpload({
  className = "",
  label,
  name,
  onChange,
  error,
  ...inputProps // accept, multiple, disabled, ... pass straight through
}) {
  const errorId = `${name}-error`;

  return (
    <div className={`${className} flex flex-col gap-1.5`}>
      <label htmlFor={name} className="text-sm font-semibold text-[#29272b]">
        {label}
      </label>
      
      <input
        id={name}
        name={name}
        type="file"
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border h-full bg-[#fff9df]/80 px-4 py-3 text-sm text-[#29272b] text-wrap placeholder:text-[#7d8794] outline-none transition
          focus:border-[#f2a451] focus:ring-2 focus:ring-[#f2a451]/20
          ${error ? "border-red-500" : "border-[#d8cdb6]"}`}
        {...inputProps}
      />

      {error && (
        <span id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}