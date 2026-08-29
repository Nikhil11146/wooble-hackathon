import Button from "../Common/Button";
import { formatDistance, formatEmploymentType, formatSalary } from "../../utils/format";

export default function JobCard({ job, onApply, onView, actionLabel = "Apply" }) {
  const distance = formatDistance(job.location?.distanceKm ?? job.distanceKm);
  const skills = job.requiredSkills || job.skills || [];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 dark:backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#e9edef]">{job.title || "Untitled job"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8696a0]">
            {job.category || "General"} - {formatEmploymentType(job.employmentType)}
            {distance && ` - ${distance}`}
          </p>
        </div>
        {job.matchScore != null && (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 dark:bg-[#00a884]/15 dark:text-[#25d366]">
            {job.matchScore}% match
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-slate-600 dark:text-[#aebac1]">
        {job.description || "No job description provided."}
      </p>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill._id || skill.name || skill}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-[#2a3942] dark:text-[#aebac1]"
            >
              {typeof skill === "string" ? skill : skill.name || skill._id}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-slate-900 dark:text-[#e9edef]">{formatSalary(job.salary)}</p>
        {job.status && (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-[#00a884]/15 dark:text-[#25d366]">
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
          <Button onClick={() => onApply(job)}>
            {actionLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
