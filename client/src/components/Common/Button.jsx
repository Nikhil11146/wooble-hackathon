const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        VARIANTS[variant] || VARIANTS.primary,
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
