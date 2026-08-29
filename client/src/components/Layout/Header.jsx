import Button from "../Common/Button";
import useTheme from "../../hooks/useTheme";

export default function Header({ user, onNavigate, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/40 bg-white/70 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-[#222d34] dark:bg-[#202c33]/90 dark:shadow-black/30 sm:px-[5vw] sm:py-3.5">
      <button
        type="button"
        onClick={() => onNavigate?.("/")}
        className="cursor-pointer border-0 bg-transparent text-lg font-black leading-none tracking-tight text-blue-700 dark:text-[#00a884] sm:text-2xl"
      >
        KaushalSetu
      </button>

      <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#2a3942] dark:text-[#e9edef] dark:hover:bg-[#2a3942]"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {user ? (
          <>
            <span className="hidden max-w-44 truncate text-sm text-slate-600 dark:text-[#e9edef] lg:inline">{user.email}</span>
            <Button size="sm" variant="secondary" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" className="px-2 sm:px-3" onClick={() => onNavigate?.("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => onNavigate?.("/register")}>Join now</Button>
          </>
        )}
      </nav>
    </header>
  );
}