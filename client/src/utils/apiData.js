export function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.skills)) return value.skills;
  if (Array.isArray(value?.certifications)) return value.certifications;
  if (Array.isArray(value?.workHistory)) return value.workHistory;
  return [];
}

export function userIdOf(user) {
  return user?.id || user?._id || "";
}

export function profileIdOf(profile, user) {
  return profile?._id || profile?.id || userIdOf(user);
}
