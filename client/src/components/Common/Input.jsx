export default function Input({ label, error, id, className = "", inputClassName = "", ...props }) {
  const inputId = id || props.name;

  return (
    <label htmlFor={inputId} className={`grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-[#e9edef] ${className}`}>
      {label && <span>{label}</span>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={[
          "min-h-12 w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] font-normal text-slate-900",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          "dark:border-[#2a3942] dark:bg-[#2a3942] dark:text-[#e9edef] dark:focus:border-[#00a884] dark:focus:ring-[#00a884]/25",
          error ? "border-red-500" : "border-slate-300",
          inputClassName,
        ].join(" ")}
        {...props}
      />
      {error && (
        <small className="font-normal text-red-600" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
