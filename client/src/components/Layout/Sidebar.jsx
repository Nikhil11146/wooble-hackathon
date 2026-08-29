import { SIDEBAR_LINKS } from "../../utils/constants";

export default function Sidebar({ role = "WORKER", activePath, onNavigate }) {
  const links = SIDEBAR_LINKS[role] || [];
  const rootPath = role === "EMPLOYER" ? "/employer" : role === "ADMIN" ? "/admin" : "/worker";

  return (
    <aside className="border-r border-[#222d34] bg-[#111b21] p-3 lg:min-h-full lg:p-4">
      <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8696a0] lg:block">
        {role.toLowerCase()} portal
      </p>
      <nav className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
        {links.map(([label, path]) => {
          const isActive = path === rootPath ? activePath === path : activePath === path || activePath.startsWith(`${path}/`);
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate?.(path)}
              className={[
                "min-h-12 shrink-0 cursor-pointer whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-[15px] font-medium transition-colors",
                isActive ? "bg-[#00a884] text-white" : "bg-transparent text-[#e9edef] hover:bg-[#2a3942]",
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
