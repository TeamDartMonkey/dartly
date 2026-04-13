export type DeadlineState = "overdue" | "upcoming" | "none";

export const DEADLINE_STATE_OPTIONS = [
  { value: "", label: "All deadlines" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
  { value: "none", label: "No deadline" },
] as const;

export function getDeadlineState(deadline?: string): "overdue" | "upcoming" | "none" | "none-set" {
  if (!deadline) return "none-set";
  const today = new Date().toISOString().slice(0, 10);
  if (deadline < today) return "overdue";
  return "upcoming";
}
