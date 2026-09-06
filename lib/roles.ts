export type Role = "STUDENT" | "STAFF" | "ADMIN";

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

const BASE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
];

const FEES_NAV: NavItem = {
  label: "Fees",
  href: "/fees",
  children: [
    { label: "Fee Submission", href: "/fees/submission" },
    { label: "Fee Receipt", href: "/fees/receipt" },
  ],
};

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [...BASE_NAV, FEES_NAV],
  STAFF: [
    ...BASE_NAV,
    { label: "Notices", href: "/notices" },
    { label: "Registrations", href: "/registrations" },
    { label: "Admissions Queue", href: "/admissions" },
    { label: "Students", href: "/students" },
  ],
  ADMIN: [
    ...BASE_NAV,
    { label: "Notices", href: "/notices" },
    { label: "Registrations", href: "/registrations" },
    { label: "Admissions Queue", href: "/admissions" },
    { label: "Students", href: "/students" },
    { label: "Staff", href: "/staff" },
    { label: "Admission Batches", href: "/batches" },
  ],
};

// ponytail: route->role map kept simple (per-page allow-list) since page count is small;
// switch to a wildcard/prefix matcher if the route tree grows past ~15 pages.
const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard": ["STUDENT", "STAFF", "ADMIN"],
  "/profile": ["STUDENT", "STAFF", "ADMIN"],
  "/notices": ["STAFF", "ADMIN"],
  "/fees/submission": ["STUDENT"],
  "/fees/receipt": ["STUDENT"],
  "/admissions": ["STAFF", "ADMIN"],
  "/registrations": ["STAFF", "ADMIN"],
  "/students": ["STAFF", "ADMIN"],
  "/staff": ["ADMIN"],
  "/batches": ["ADMIN"],
};

export function navForRole(role: Role): NavItem[] {
  return NAV_BY_ROLE[role];
}

export function isRouteAllowed(pathname: string, role: Role): boolean {
  const allowed = ROUTE_ROLES[pathname];
  if (!allowed) return true;
  return allowed.includes(role);
}
