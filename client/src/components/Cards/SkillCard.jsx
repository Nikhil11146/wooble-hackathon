import Button from "../Common/Button";
import { VERIFICATION_COLOURS, VERIFICATION_STATUS } from "../../utils/constants";

function resolveStatus(skill) {
  if (skill.verificationStatus) return skill.verificationStatus;
  if (skill.verificationType) return skill.verificationType;
  return skill.verified ? "APPROVED" : "SELF_DECLARED";
}

export default function SkillCard({ skill, onEdit, onDelete, onVerify }) {
  const status = resolveStatus(skill);
  const badgeClass = VERIFICATION_COLOURS[status] || "bg-slate-100 text-slate-700";
  const label = VERIFICATION_STATUS[status] || status.replaceAll("_", " ");

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <strong className="text-base text-slate-900">{skill.name}</strong>
        {skill.category && (
          <p className="mt-1 text-sm text-slate-500">{skill.category}</p>
        )}
        <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {onVerify && status !== "APPROVED" && status !== "PENDING" && (
          <Button variant="ghost" className="min-h-10 px-3" onClick={() => onVerify(skill)}>
            Verify
          </Button>
        )}
        {onEdit && (
          <Button variant="secondary" className="min-h-10 px-3" onClick={() => onEdit(skill)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" className="min-h-10 px-3 text-red-600 hover:bg-red-50" onClick={() => onDelete(skill)}>
            Remove
          </Button>
        )}
      </div>
    </article>
  );
}
