export const ROLE_RANK = { staff: 1, storekeeper: 2, admin: 3 };

export function hasRole(profile, minRole) {
  if (!profile || !profile.role) return false;
  return ROLE_RANK[profile.role] >= ROLE_RANK[minRole];
}
// Minimum role to see each page, mirrors ACTION_ROLES in backend/stock.gs.
export const PAGE_ROLES = {
  usage: 'staff',
  restock: 'storekeeper',
  stock: 'staff',
  telegram: 'admin',
  users: 'admin',
}