import type { Role } from "@/lib/roles";

export type User = {
  id: string;
  email: string;
  role: Role;
  // Present on the /students and /staff list responses (StudentsService's
  // userSelect) — not on every User-shaped payload in the app, but safe to
  // declare optional here rather than a second near-duplicate type.
  fullName?: string;
  ukssuId?: string | null;
  registrationNumber?: string | null;
  phone?: string | null;
  dob?: string | null;
};

export type Student = {
  id: string;
  userId: string;
  rollNumber: string | null;
  programme: string | null;
  user: User;
  // Only present when the caller's query includes it (e.g. the staff
  // students list) — the id is enough to link to the admission detail view.
  // paid/status are additionally present on the registrations list.
  admission?: {
    id: string;
    paid?: boolean;
    status?: AdmissionStatus;
    coachingDiscipline?: string | null;
    gender?: string | null;
  } | null;
};

export type Staff = {
  id: string;
  userId: string;
  department: string | null;
  designation: string | null;
  user: User;
};

export type AdmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type AdmissionApplicant = {
  id: string;
  rollNumber: string | null;
  programme: string | null;
  country: { id: string; name: string } | null;
  state: { id: string; name: string } | null;
  programmeLevel: "UG" | "PG" | "DIPLOMA" | null;
  user: {
    fullName: string;
    email: string;
    phone: string | null;
    dob: string | null;
    ukssuId: string | null;
    registrationNumber: string | null;
  };
};

export type AdmissionParentDetails = {
  fatherName: string | null;
  motherName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  occupation: string | null;
} | null;

export type AdmissionAddressDetails = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
} | null;

export type AdmissionAcademicDetails = {
  tenthBoard: string | null;
  tenthRollNo: string | null;
  tenthYear: number | null;
  tenthPercentage: number | null;
  twelfthBoard: string | null;
  twelfthStream: string | null;
  twelfthYear: number | null;
  twelfthPercentage: number | null;
  gapYear: boolean | null;
  graduationDiscipline: string | null;
  graduationInstitution: string | null;
  graduationYear: number | null;
  graduationStatus: string | null;
  graduationPercentage: number | null;
} | null;

export type AdmissionSportsDetails = {
  primarySport: string | null;
  highestLevel: string | null;
  positionHeld: string | null;
  certifyingAuthority: string | null;
  yearOfAchievement: number | null;
  eminentSportsperson: boolean | null;
} | null;

export type AdmissionDocument = {
  id: string;
  type: string;
  filename: string;
  url: string | null;
  mimeType: string | null;
  uploadedAt: string;
};

export type Admission = {
  id: string;
  studentId: string;
  // Staff review outcome. APPROVED issues ukssuId (only allowed once
  // `paid` is true) — see ussu-api's AdmissionsService.updateStatus.
  status: AdmissionStatus;
  // True once the admission fee payment is verified — the gate for staff
  // review to begin (Approve/Reject actions only appear once paid).
  paid: boolean;
  submittedAt: string;
  reviewedAt: string | null;
  batch: AdmissionBatch;
  student: AdmissionApplicant;
  nationality: string | null;
  aadharNumber: string | null;
  category: string | null;
  gender: string | null;
  bloodGroup: string | null;
  uttarakhandDomicile: boolean | null;
  mediumOfInstruction: string | null;
  hostelRequired: boolean | null;
  coachingDiscipline: string | null;
  amountPaid: number | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  parentDetails: AdmissionParentDetails;
  addressDetails: AdmissionAddressDetails;
  academicDetails: AdmissionAcademicDetails;
  sportsDetails: AdmissionSportsDetails;
  documents: AdmissionDocument[];
};

export type AdmissionBatch = {
  id: string;
  label: string;
  isActive: boolean;
  startedAt: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  createdAt: string;
};

export type TrendPoint = {
  day: string;
  count: number;
};

export type AnalyticsOverview = {
  totalRegistrations: number;
  admissionsCompleted: number;
  pendingAdmissions: number;
  totalStudents: number;
  totalStaff: number;
  registrationTrend: TrendPoint[];
};

export type VisitorStats = {
  totalUnique: number;
  last7Days: number;
  thisMonth: number;
  thisYear: number;
  trend: TrendPoint[];
};
