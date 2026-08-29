import heroImage from "../assets/hero.png";
import Button from "../components/Common/Button";

const portals = [
  { role: "Worker", path: "/login", email: "worker@demo.com", text: "Find jobs, manage skills, and track applications." },
  { role: "Employer", path: "/login", email: "employer@demo.com", text: "Post jobs, search candidates, and move hiring forward." },
  { role: "Admin", path: "/login", email: "admin@demo.com", text: "Review verifications and watch platform health." },
];

export default function Landing({ onNavigate }) {
  return (
    <main>
      <section className="relative isolate min-h-[70vh] overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35"
        />
        <div className="mx-auto grid min-h-[70vh] max-w-6xl content-center gap-8 px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">KaushalSetu</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Verified blue-collar hiring for workers and employers.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-200">
              Worker profiles, transparent trust scores, job matching, hiring pipeline, and admin verification in one client.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => onNavigate?.("/login")}>Log in</Button>
              <Button variant="secondary" onClick={() => onNavigate?.("/register")}>
                Create account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {portals.map((portal) => (
          <article key={portal.role} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{portal.role}</h2>
            <p className="mt-2 text-sm text-slate-600">{portal.text}</p>
            <p className="mt-4 text-xs font-semibold text-slate-500">{portal.email}</p>
            <Button variant="ghost" className="mt-3 px-0" onClick={() => onNavigate?.(portal.path)}>
              Use demo login
            </Button>
          </article>
        ))}
      </section>
    </main>
  );
}
