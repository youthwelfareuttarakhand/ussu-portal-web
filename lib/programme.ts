// Course rows have been saved under both the official name and this older
// short name — normalize so the admin UI always shows the official name
// regardless of which one is on the Student/Course record.
const PROGRAMME_DISPLAY_NAMES: Record<string, string> = {
  "Sports Coaching": "Diploma in Sports Coaching",
};

export function formatProgramme(programme: string | null | undefined, coachingDiscipline?: string | null) {
  if (!programme) return "—";
  const displayName = PROGRAMME_DISPLAY_NAMES[programme] ?? programme;
  // coachingDiscipline is only ever set on Diploma in Sports Coaching
  // applications (see AdmissionWizard's isDiploma gating), so no need to
  // also match on programme name here.
  if (coachingDiscipline) {
    return `${displayName} - (${coachingDiscipline})`;
  }
  return displayName;
}
