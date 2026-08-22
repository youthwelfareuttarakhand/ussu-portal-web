// Fixed filter option lists for the (now server-paginated) Admissions Queue
// and Registrations tables. Previously these were derived client-side from
// whatever rows happened to be in the fetched dataset — now that filtering
// happens server-side against the full table, not just the current page,
// the option lists need to be known up front instead of derived from data
// that may not include every course/gender/discipline in view.
export const COURSE_OPTIONS = [
  "Bachelor of Sports Science",
  "Bachelor of Sports Management",
  "Bachelor of Sports Journalism",
  "Diploma in Sports Coaching",
];

export const GENDER_OPTIONS = ["Male", "Female", "Other"];

// Matches Admission.coachingDiscipline's comment in prisma/schema.prisma.
export const DISCIPLINE_OPTIONS = [
  "Badminton",
  "Basketball",
  "Boxing",
  "Football",
  "Hockey",
  "Ice Sports",
  "Karate",
  "Swimming",
  "Taekwondo",
];
