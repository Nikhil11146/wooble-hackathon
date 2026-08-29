export function formatSalary(salary) {
  if (!salary?.min && !salary?.max) return "Salary not listed";
  const fmt = (value) => Number(value).toLocaleString("en-IN");
  const currency = salary.currency === "INR" || !salary.currency ? "₹" : `${salary.currency} `;
  if (salary.min && salary.max) return `${currency}${fmt(salary.min)} – ${currency}${fmt(salary.max)}`;
  if (salary.min) return `From ${currency}${fmt(salary.min)}`;
  return `Up to ${currency}${fmt(salary.max)}`;
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return null;
  const value = Number(km);
  if (value <= 5) return "Within 5 km";
  return `${value} km away`;
}

export function formatEmploymentType(type) {
  return (type || "FULL_TIME").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRating(rating) {
  if (rating == null) return null;
  return `${Number(rating).toFixed(1)}/5`;
}

export function trustScoreColour(score) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  if (safe >= 75) return "text-green-600";
  if (safe >= 50) return "text-amber-600";
  return "text-red-600";
}
