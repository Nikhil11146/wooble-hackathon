import Button from "../Common/Button";
import { formatDistance, formatEmploymentType, formatSalary } from "../../utils/format";

export default function JobCard({ job, onApply, onView }) {
  const distance = formatDistance(job.location?.distanceKm ?? job.distanceKm);
  const skills = job.requiredSkills || job.skills || [];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {job.category || "General"} · {formatEmploymentType(job.employmentType)}
            {distance && ` · ${distance}`}
          </p>
        </div>
        {job.matchScore != null && (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
            {job.matchScore}% match
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-slate-600">
        {job.description || "No job description provided."}
      </p>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill._id || skill.name || skill}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {typeof skill === "string" ? skill : skill.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-slate-900">{formatSalary(job.salary)}</p>
        {job.status && (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {job.status}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onView && (
          <Button variant="secondary" onClick={() => onView(job)}>
            View
          </Button>
        )}
        {onApply && (
          <Button onClick={() => onApply(job)}>Apply</Button>
        )}
      </div>
    </article>
  );
}
