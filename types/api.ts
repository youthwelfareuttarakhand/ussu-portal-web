import type { Role } from "@/lib/roles";

export type User = {
  id: string;
  email: string;
  role: Role;
};

export type Student = {
  id: string;
  userId: string;
  rollNumber: string | null;
  programme: string | null;
  user: User;
};

export type Staff = {
  id: string;
  userId: string;
  department: string | null;
  designation: string | null;
  user: User;
};

export type AdmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type Admission = {
  id: string;
  studentId: string;
  status: AdmissionStatus;
  formData: Record<string, unknown>;
  submittedAt: string;
  reviewedAt: string | null;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  createdAt: string;
};
