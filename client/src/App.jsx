import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_EVENTS } from "./utils/constants.js";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Footer from "./components/Layout/Footer";
import Button from "./components/Common/Button";
import { AuthProvider } from "./hooks/AuthProvider";
import useAuth from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import WorkerOnboarding from "./pages/Auth/WorkerOnboarding";
import WorkerDashboard from "./pages/Worker/Dashboard";
import WorkerProfile from "./pages/Worker/Profile";
import WorkerSkills from "./pages/Worker/Skills";
import WorkerJobDiscovery from "./pages/Worker/JobDiscovery";
import WorkerApplications from "./pages/Worker/Applications";
import WorkerMessages from "./pages/Worker/Messages";
import EmployerDashboard from "./pages/Employer/Dashboard";
import EmployerPostJob from "./pages/Employer/PostJob";
import EmployerCandidateSearch from "./pages/Employer/CandidateSearch";
import EmployerPipeline from "./pages/Employer/Pipeline";
import EmployerAnalytics from "./pages/Employer/Analytics";
import EmployerMessages from "./pages/Employer/Messages";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminVerifications from "./pages/Admin/Verifications";
import AdminPlatformStats from "./pages/Admin/PlatformStats";

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path) => {
    if (!path || path === window.location.pathname) return;
    window.history.pushState({}, "", path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return [pathname, navigate];
}

function roleForPath(pathname) {
  if (pathname.startsWith("/employer")) return "EMPLOYER";
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/worker")) return "WORKER";
  return null;
}

function NotFound({ onNavigate }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-2 text-slate-600">This route is not part of the current client.</p>
      <Button className="mt-5" onClick={() => onNavigate("/")}>
        Go home
      </Button>
    </section>
  );
}

function AccessDenied({ onNavigate, dashboardPath }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-950">Access denied</h1>
      <p className="mt-2 text-slate-600">Your current account does not have access to this portal.</p>
      <Button className="mt-5" onClick={() => onNavigate(dashboardPath)}>
        Open my dashboard
      </Button>
    </section>
  );
}

function PortalFrame({ role, pathname, onNavigate, children }) {
  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar role={role} activePath={pathname} onNavigate={onNavigate} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function ClientApp() {
  const [pathname, navigate] = usePathname();
  const auth = useAuth();
  const routeRole = roleForPath(pathname);

  const logout = useCallback(async () => {
    await auth.logout();
    navigate("/");
  }, [auth, navigate]);

  useEffect(() => {
    const handleAuthExpired = () => navigate("/");
    window.addEventListener(AUTH_EVENTS.EXPIRED, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EVENTS.EXPIRED, handleAuthExpired);
  }, [navigate]);

  const page = useMemo(() => {
    if (auth.loading) {
      return <main className="px-4 py-16 text-center text-slate-600">Loading session...</main>;
    }

    if (pathname === "/") return <Landing onNavigate={navigate} />;
    if (pathname === "/login") return <Login onNavigate={navigate} />;
    if (pathname === "/register") return <Register onNavigate={navigate} />;

    if (routeRole && !auth.isAuthenticated) {
      return <Login onNavigate={navigate} redirectTo={pathname} />;
    }

    if (routeRole && auth.user?.role !== routeRole) {
      return <AccessDenied onNavigate={navigate} dashboardPath={auth.dashboardPath} />;
    }

    if (pathname === "/worker") return <WorkerDashboard onNavigate={navigate} />;
    if (pathname === "/worker/onboarding") return <WorkerOnboarding onNavigate={navigate} />;
    if (pathname === "/worker/profile") return <WorkerProfile />;
    if (pathname === "/worker/skills") return <WorkerSkills />;
    if (pathname === "/worker/jobs") return <WorkerJobDiscovery />;
    if (pathname === "/worker/applications") return <WorkerApplications />;
    if (pathname === "/worker/messages") return <WorkerMessages />;

    if (pathname === "/employer") return <EmployerDashboard onNavigate={navigate} />;
    if (pathname === "/employer/jobs/new") return <EmployerPostJob onNavigate={navigate} />;
    if (pathname === "/employer/candidates") return <EmployerCandidateSearch />;
    if (pathname === "/employer/pipeline") return <EmployerPipeline />;
    if (pathname === "/employer/messages") return <EmployerMessages />;
    if (pathname === "/employer/analytics") return <EmployerAnalytics />;

    if (pathname === "/admin") return <AdminDashboard />;
    if (pathname === "/admin/verifications") return <AdminVerifications />;
    if (pathname === "/admin/stats") return <AdminPlatformStats />;

    return <NotFound onNavigate={navigate} />;
  }, [auth, navigate, pathname, routeRole]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <Header user={auth.user} onNavigate={navigate} onLogout={logout} />
      {routeRole && auth.isAuthenticated && auth.user?.role === routeRole ? (
        <PortalFrame role={routeRole} pathname={pathname} onNavigate={navigate}>
          {page}
        </PortalFrame>
      ) : (
        <>
          {page}
          <Footer />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClientApp />
    </AuthProvider>
  );
}
