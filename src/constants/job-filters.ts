import { localTodayString } from "@/utils/datetime";

export type DeadlineState = "overdue" | "upcoming" | "none";

export const DEADLINE_STATE_OPTIONS = [
  { value: "", label: "All deadlines" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
  { value: "none", label: "No deadline" },
] as const;

export function getDeadlineState(deadline?: string): "overdue" | "upcoming" | "none" | "none-set" {
  if (!deadline) return "none-set";
  // Local date — see utils/deadline.ts for why UTC slice would be wrong.
  if (deadline < localTodayString()) return "overdue";
  return "upcoming";
}
