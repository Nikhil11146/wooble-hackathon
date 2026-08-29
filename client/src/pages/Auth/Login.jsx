import { useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import { Notice } from "../../components/Common/PageState";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/auth";
import { validateLogin } from "../../utils/validation";

const demoAccounts = [
  { label: "Worker", email: "worker@demo.com", password: "Demo123!" },
  { label: "Employer", email: "employer@demo.com", password: "Demo123!" },
  { label: "Admin", email: "admin@demo.com", password: "Demo123!" },
];

export default function Login({ onNavigate, redirectTo }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitLogin = async (credentials) => {
    const validation = validateLogin(credentials);
    setErrors(validation.errors);
    setApiError("");
    if (!validation.valid) return;

    setSubmitting(true);
    try {
      const session = await login(credentials);
      onNavigate?.(redirectTo || getDashboardPath(session.user?.role));
    } catch (error) {
      setApiError(error.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    submitLogin(form);
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-145px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Open the right portal for your account.</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setForm(account);
                submitLogin(account);
              }}
              className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300"
            >
              <span className="block font-semibold text-slate-950">{account.label}</span>
              <span className="mt-1 block text-sm text-slate-500">{account.email}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Log in</h2>
        <form onSubmit={submit} className="mt-5 grid gap-4">
          {apiError && <Notice type="error">{apiError}</Notice>}
          <Input label="Email" type="email" value={form.email} onChange={setField("email")} error={errors.email} />
          <Input label="Password" type="password" value={form.password} onChange={setField("password")} error={errors.password} />
          <Button type="submit" loading={submitting}>
            Log in
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here?{" "}
          <button type="button" className="font-semibold text-blue-700" onClick={() => onNavigate?.("/register")}>
            Create an account
          </button>
        </p>
      </section>
    </main>
  );
}
