import Button from "../Common/Button";
import TrustScore from "../Common/TrustScore";
import { AVAILABILITY_LABELS } from "../../utils/constants";
import { formatDistance, formatRating } from "../../utils/format";

export default function CandidateCard({
  candidate,
  matchScore,
  matchReasons = [],
  onView,
  onShortlist,
  shortlistDisabled = false,
}) {
  const skills = candidate.skills || [];
  const distance = formatDistance(candidate.location?.distanceKm ?? candidate.distanceKm);
  const rating = formatRating(candidate.averageRating);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{candidate.name || "Unnamed worker"}</h3>
            {matchScore != null && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                {matchScore}% match
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {candidate.primaryOccupation || "Worker"} - {candidate.yearsOfExperience || 0} years experience
            {rating && ` - ${rating}`}
          </p>
          {candidate.availability && (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              {AVAILABILITY_LABELS[candidate.availability] || candidate.availability}
            </p>
          )}
          {distance && <p className="mt-1 text-sm text-slate-500">{distance}</p>}
          <p className="mt-2 text-sm text-slate-700">
            {skills.map((skill) => (typeof skill === "string" ? skill : skill.name)).filter(Boolean).join(", ") || "No skills added"}
          </p>
        </div>
        <TrustScore score={candidate.kaushalTrustScore} size={54} showLabel={false} />
      </div>

      {matchReasons.length > 0 && (
        <ul className="mt-4 grid gap-1.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {matchReasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2">
              <span className="font-bold text-green-600">OK</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {onView && (
          <Button variant="secondary" onClick={() => onView(candidate)}>
            View profile
          </Button>
        )}
        {onShortlist && (
          <Button disabled={shortlistDisabled} onClick={() => onShortlist(candidate)}>
            Shortlist
          </Button>
        )}
      </div>
    </article>
  );
}
