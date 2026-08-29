import { useState } from "react";
import Button from "../Common/Button";
import Input from "../Common/Input";
import { AVAILABILITY_LABELS } from "../../utils/constants";

export default function ProfileForm({ profile = {}, role = "WORKER", onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    companyName: profile.companyName || "",
    phone: profile.phone || "",
    headline: profile.headline || "",
    bio: profile.bio || "",
    yearsOfExperience: profile.yearsOfExperience ?? 0,
    primaryOccupation: profile.primaryOccupation || "",
    languages: (profile.languages || []).join(", "),
    expectedSalaryMin: profile.expectedSalary?.min ?? "",
    expectedSalaryMax: profile.expectedSalary?.max ?? "",
    availability: profile.availability || "AVAILABLE",
  });

  const set = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      phone: form.phone.trim(),
      headline: form.headline.trim(),
      bio: form.bio.trim(),
    };

    if (role === "EMPLOYER") {
      payload.companyName = form.companyName.trim();
    } else {
      payload.name = form.name.trim();
      payload.primaryOccupation = form.primaryOccupation.trim();
      payload.yearsOfExperience = Number(form.yearsOfExperience) || 0;
      payload.languages = form.languages
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean);
      payload.expectedSalary = {
        min: Number(form.expectedSalaryMin) || 0,
        max: Number(form.expectedSalaryMax) || 0,
        currency: "INR",
      };
      payload.availability = form.availability;
    }

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {role === "EMPLOYER" ? (
        <Input label="Company name" value={form.companyName} onChange={set("companyName")} required />
      ) : (
        <>
          <Input label="Full name" value={form.name} onChange={set("name")} required />
          <Input label="Primary occupation" value={form.primaryOccupation} onChange={set("primaryOccupation")} />
          <Input
            label="Years of experience"
            type="number"
            min="0"
            value={form.yearsOfExperience}
            onChange={set("yearsOfExperience")}
          />
        </>
      )}

      <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
      <Input label="Headline" value={form.headline} onChange={set("headline")} placeholder="Short professional summary" />

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        About
        <textarea
          value={form.bio}
          onChange={set("bio")}
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {role === "WORKER" && (
        <>
          <Input
            label="Languages spoken"
            value={form.languages}
            onChange={set("languages")}
            placeholder="English, Hindi, Telugu"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expected salary min (₹)"
              type="number"
              min="0"
              value={form.expectedSalaryMin}
              onChange={set("expectedSalaryMin")}
            />
            <Input
              label="Expected salary max (₹)"
              type="number"
              min="0"
              value={form.expectedSalaryMax}
              onChange={set("expectedSalaryMax")}
            />
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Availability
            <select
              value={form.availability}
              onChange={set("availability")}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <Button type="submit" loading={submitting}>
        Save profile
      </Button>
    </form>
  );
}
