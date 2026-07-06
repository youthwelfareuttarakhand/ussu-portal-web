export type Role = "STUDENT" | "STAFF" | "ADMIN";

export type NavItem = {
  label: string;
  href: string;
};

const BASE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Notices", href: "/notices" },
];

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [...BASE_NAV, { label: "My Admission", href: "/admissions" }],
  STAFF: [
    ...BASE_NAV,
    { label: "Admissions Queue", href: "/admissions" },
    { label: "Students", href: "/students" },
  ],
  ADMIN: [
    ...BASE_NAV,
    { label: "Admissions Queue", href: "/admissions" },
    { label: "Students", href: "/students" },
    { label: "Staff", href: "/staff" },
  ],
};

// ponytail: route->role map kept simple (per-page allow-list) since page count is small;
// switch to a wildcard/prefix matcher if the route tree grows past ~15 pages.
const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard": ["STUDENT", "STAFF", "ADMIN"],
  "/profile": ["STUDENT", "STAFF", "ADMIN"],
  "/notices": ["STUDENT", "STAFF", "ADMIN"],
  "/admissions": ["STUDENT", "STAFF", "ADMIN"],
  "/students": ["STAFF", "ADMIN"],
  "/staff": ["ADMIN"],
};

export function navForRole(role: Role): NavItem[] {
  return NAV_BY_ROLE[role];
}

export function isRouteAllowed(pathname: string, role: Role): boolean {
  const allowed = ROUTE_ROLES[pathname];
  if (!allowed) return true;
  return allowed.includes(role);
}
