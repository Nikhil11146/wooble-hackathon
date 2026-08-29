const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-[#00a884] dark:hover:bg-[#06cf9c]",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-[#2a3942] dark:text-[#e9edef] dark:hover:bg-[#36454f]",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50 dark:text-[#00a884] dark:hover:bg-[#00a884]/10",
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
        "inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        VARIANTS[variant] || VARIANTS.primary,
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
