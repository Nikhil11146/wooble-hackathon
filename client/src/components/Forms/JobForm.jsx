import { useState } from "react";
import Button from "../Common/Button";
import Input from "../Common/Input";
import { EMPLOYMENT_TYPES } from "../../utils/constants";

const defaultForm = {
  title: "",
  category: "",
  description: "",
  minExperience: 0,
  maxExperience: "",
  salaryMin: "",
  salaryMax: "",
  employmentType: "FULL_TIME",
  numberOfPositions: 1,
  startDate: "",
  requiredSkills: "",
};

export default function JobForm({ initialValue = {}, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    ...defaultForm,
    title: initialValue.title || "",
    category: initialValue.category || "",
    description: initialValue.description || "",
    minExperience: initialValue.minExperience ?? 0,
    maxExperience: initialValue.maxExperience ?? "",
    salaryMin: initialValue.salary?.min ?? "",
    salaryMax: initialValue.salary?.max ?? "",
    employmentType: initialValue.employmentType || "FULL_TIME",
    numberOfPositions: initialValue.numberOfPositions ?? 1,
    startDate: initialValue.startDate ? initialValue.startDate.slice(0, 10) : "",
    requiredSkills: (initialValue.requiredSkills || [])
      .map((skill) => (typeof skill === "string" ? skill : skill.name))
      .filter(Boolean)
      .join(", "),
  });

  const set = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit?.({
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      minExperience: Number(form.minExperience) || 0,
      maxExperience: form.maxExperience ? Number(form.maxExperience) : undefined,
      salary: {
        min: Number(form.salaryMin) || 0,
        max: Number(form.salaryMax) || 0,
        currency: "INR",
      },
      employmentType: form.employmentType,
      numberOfPositions: Number(form.numberOfPositions) || 1,
      startDate: form.startDate || undefined,
      requiredSkills: form.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Input label="Job title" value={form.title} onChange={set("title")} required />
      <Input label="Category" value={form.category} onChange={set("category")} placeholder="e.g. Electrical" />

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        Description
        <textarea
          value={form.description}
          onChange={set("description")}
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <Input
        label="Required skills"
        value={form.requiredSkills}
        onChange={set("requiredSkills")}
        placeholder="Electrical, Safety, Wiring"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Minimum experience (years)" type="number" min="0" value={form.minExperience} onChange={set("minExperience")} />
        <Input label="Maximum experience (years)" type="number" min="0" value={form.maxExperience} onChange={set("maxExperience")} />
        <Input label="Minimum salary (₹)" type="number" min="0" value={form.salaryMin} onChange={set("salaryMin")} />
        <Input label="Maximum salary (₹)" type="number" min="0" value={form.salaryMax} onChange={set("salaryMax")} />
        <Input label="Positions" type="number" min="1" value={form.numberOfPositions} onChange={set("numberOfPositions")} />
        <Input label="Start date" type="date" value={form.startDate} onChange={set("startDate")} />
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        Employment type
        <select
          value={form.employmentType}
          onChange={set("employmentType")}
          className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" loading={submitting}>
        {initialValue._id ? "Save job" : "Post job"}
      </Button>
    </form>
  );
}
