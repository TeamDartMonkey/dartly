export type DashboardView = "card" | "list";

export type UserPreferences = {
  defaultJobStage: "INTERESTED" | "APPLIED" | "INTERVIEW" | "OFFER";
  showArchived: boolean;
  dashboardView: DashboardView;
  autoArchiveRejected: boolean;
  autoArchiveRejectedDays: number;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultJobStage: "INTERESTED",
  showArchived: false,
  dashboardView: "card",
  autoArchiveRejected: false,
  autoArchiveRejectedDays: 30,
};
