export const ROLE_RANK = { staff: 1, storekeeper: 2, admin: 3 };

export function hasRole(profile, minRole) {
  if (!profile || !profile.role) return false;
  return ROLE_RANK[profile.role] >= ROLE_RANK[minRole];
}
