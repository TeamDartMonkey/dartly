export type Urgency = "overdue" | "due-soon" | "upcoming" | "none";

const DUE_SOON_DAYS = 7;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`);
  const db = new Date(`${b}T00:00:00Z`);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUrgency(deadline?: string): Urgency {
  if (!deadline) return "none";
  const days = diffDays(deadline, todayStr());
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due-soon";
  return "upcoming";
}

export function isOverdue(deadline: string): boolean {
  return deadline < todayStr();
}

export const URGENCY_STYLES: Record<Urgency, { badge: string; label: string }> = {
  overdue: {
    badge: "bg-red-950 text-red-400 border-red-800",
    label: "Overdue",
  },
  "due-soon": {
    badge: "bg-amber-950 text-amber-400 border-amber-800",
    label: "Due soon",
  },
  upcoming: {
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
    label: "Upcoming",
  },
  none: {
    badge: "",
    label: "",
  },
};
