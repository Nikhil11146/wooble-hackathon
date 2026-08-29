import { TRUST_SCORE_FACTORS } from "../../utils/constants";
import { trustScoreColour } from "../../utils/format";

function scoreRingColour(score) {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

export default function TrustScore({
  score = 0,
  size = 64,
  showLabel = true,
  breakdown,
  className = "",
}) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const ringColour = scoreRingColour(safeScore);
  const innerSize = size * 0.73;

  return (
    <div
      aria-label={`Kaushal trust score ${safeScore} out of 100`}
      className={`flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="relative flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(${ringColour} ${safeScore * 3.6}deg, #e2e8f0 0)`,
          }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-white font-bold text-slate-900 dark:bg-[#202c33] dark:text-[#e9edef]"
            style={{ width: innerSize, height: innerSize, fontSize: size * 0.24 }}
          >
            {safeScore}
          </div>
        </div>
        {showLabel && (
          <div>
            <p className={`text-lg font-bold tracking-tight ${trustScoreColour(safeScore)}`}>Trust score</p>
            <p className="text-[15px] text-slate-500 dark:text-[#8696a0]">Kaushal verified profile strength</p>
          </div>
        )}
      </div>

      {breakdown && (
        <ul className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-[#2a3942]">
          {TRUST_SCORE_FACTORS.map(({ key, label, max }) => {
            const value = breakdown[key] ?? 0;
            return (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-[#aebac1]">{label}</span>
                <span className="font-semibold text-slate-900 dark:text-[#e9edef]">
                  +{value}
                  <span className="font-normal text-slate-400 dark:text-[#8696a0]"> / {max}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
