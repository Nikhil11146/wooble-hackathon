import { SIDEBAR_LINKS } from "../../utils/constants";

export default function Sidebar({ role = "WORKER", activePath, onNavigate }) {
  const links = SIDEBAR_LINKS[role] || [];
  const rootPath = role === "EMPLOYER" ? "/employer" : role === "ADMIN" ? "/admin" : "/worker";

  return (
    <aside className="bg-slate-900 p-3 lg:min-h-full lg:p-4">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {role.toLowerCase()} portal
      </p>
      <nav className="flex gap-1.5 overflow-x-auto lg:grid lg:overflow-visible">
        {links.map(([label, path]) => {
          const isActive = path === rootPath ? activePath === path : activePath === path || activePath.startsWith(`${path}/`);
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate?.(path)}
              className={[
                "min-h-12 shrink-0 cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
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
