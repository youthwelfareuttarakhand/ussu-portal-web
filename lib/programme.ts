const SPORTS_COACHING_PROGRAMME = "Diploma in Sports Coaching";

export function formatProgramme(programme: string | null | undefined, coachingDiscipline?: string | null) {
  if (!programme) return "—";
  if (programme === SPORTS_COACHING_PROGRAMME && coachingDiscipline) {
    return `${programme} - (${coachingDiscipline})`;
  }
  return programme;
}
