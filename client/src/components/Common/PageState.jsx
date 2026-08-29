import Button from "./Button";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-[#00a884]">{eyebrow}</p>}
        <h1 className="mt-1.5 text-[1.75rem] font-extrabold tracking-tight text-slate-950 dark:text-[#e9edef] sm:text-[2.125rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-600 dark:text-[#8696a0]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, meta }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
      <p className="text-[13px] font-semibold text-slate-500 dark:text-[#8696a0]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-[#e9edef]">{value}</p>
      {meta && <p className="mt-1.5 text-[13px] text-slate-500 dark:text-[#8696a0]">{meta}</p>}
    </article>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:text-[#aebac1] dark:shadow-black/25 dark:backdrop-blur">
      {label}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center dark:border-[#2a3942] dark:bg-[#202c33] dark:backdrop-blur">
      <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#e9edef]">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-[#8696a0]">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const message = typeof error === "string" ? error : error?.message || "Something went wrong.";
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3 min-h-10 bg-white px-3" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function Notice({ type = "info", children }) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-lg border p-3 text-sm ${classes[type] || classes.info}`}>
      {children}
    </div>
  );
}
