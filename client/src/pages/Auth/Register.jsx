import { useState } from "react";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import { Notice } from "../../components/Common/PageState";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/auth";
import { ROLES } from "../../utils/constants";
import { validateRegister } from "../../utils/validation";

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    role: ROLES.WORKER,
    name: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const validation = validateRegister(form);
    setErrors(validation.errors);
    setApiError("");
    if (!validation.valid) return;

    setSubmitting(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        name: form.role === ROLES.WORKER ? form.name : undefined,
        companyName: form.role === ROLES.EMPLOYER ? form.companyName : undefined,
      };
      const session = await register(payload);
      onNavigate?.(session.user?.role === ROLES.WORKER ? "/worker/onboarding" : getDashboardPath(session.user?.role));
    } catch (error) {
      setApiError(error.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-145px)] max-w-2xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-[#00a884]">Create account</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-[#e9edef]">Start with a worker or employer profile.</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          {apiError && <Notice type="error">{apiError}</Notice>}

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-[#e9edef]">
            Account type
            <select
              value={form.role}
              onChange={setField("role")}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-[#2a3942] dark:bg-[#2a3942] dark:text-[#e9edef] dark:focus:border-[#00a884] dark:focus:ring-[#00a884]/25"
            >
              <option value={ROLES.WORKER}>Worker</option>
              <option value={ROLES.EMPLOYER}>Employer</option>
            </select>
            {errors.role && <small className="font-normal text-red-600">{errors.role}</small>}
          </label>

          {form.role === ROLES.WORKER ? (
            <Input label="Full name" value={form.name} onChange={setField("name")} error={errors.name} />
          ) : (
            <Input label="Company name" value={form.companyName} onChange={setField("companyName")} error={errors.companyName} />
          )}

          <Input label="Email" type="email" value={form.email} onChange={setField("email")} error={errors.email} />
          <Input label="Phone" type="tel" value={form.phone} onChange={setField("phone")} />
          <Input label="Password" type="password" value={form.password} onChange={setField("password")} error={errors.password} />

          <Button type="submit" loading={submitting}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-[#aebac1]">
          Already registered?{" "}
          <button type="button" className="font-semibold text-blue-700 dark:text-[#00a884]" onClick={() => onNavigate?.("/login")}>
            Log in
          </button>
        </p>
      </section>
    </main>
  );
}
