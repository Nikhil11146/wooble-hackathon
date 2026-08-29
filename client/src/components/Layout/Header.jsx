import Button from "../Common/Button";

export default function Header({ user, onNavigate, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-[5vw] py-3.5">
      <button
        type="button"
        onClick={() => onNavigate?.("/")}
        className="cursor-pointer border-0 bg-transparent text-xl font-extrabold text-blue-700"
      >
        KaushalSetu
      </button>

      <nav className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-slate-600 sm:inline">{user.email}</span>
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
