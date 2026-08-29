import { SIDEBAR_LINKS } from "../../utils/constants";

export default function Sidebar({ role = "WORKER", activePath, onNavigate }) {
  const links = SIDEBAR_LINKS[role] || [];

  return (
    <aside className="min-h-full bg-slate-900 p-4">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {role.toLowerCase()} portal
      </p>
      <nav className="grid gap-1.5">
        {links.map(([label, path]) => {
          const isActive = activePath === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate?.(path)}
              className={[
                "min-h-12 cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isActive ? "bg-blue-700 text-white" : "bg-transparent text-slate-100 hover:bg-slate-800",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
