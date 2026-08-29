import Button from "../Common/Button";
import useTheme from "../../hooks/useTheme";

export default function Header({ user, onNavigate, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/40 bg-white/70 px-[5vw] py-3.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-[#222d34] dark:bg-[#202c33]/90 dark:shadow-black/30">
      <button
        type="button"
        onClick={() => onNavigate?.("/")}
        className="cursor-pointer border-0 bg-transparent text-2xl font-black tracking-tight text-blue-700 dark:text-[#00a884]"
      >
        KaushalSetu
      </button>

      <nav className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-[#e9edef] dark:hover:bg-[#2a3942]"
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
            <span className="hidden text-sm text-slate-600 dark:text-[#e9edef] sm:inline">{user.email}</span>
            <Button variant="secondary" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => onNavigate?.("/login")}>
              Log in
            </Button>
            <Button onClick={() => onNavigate?.("/register")}>Join now</Button>
          </>
        )}
      </nav>
    </header>
  );
}