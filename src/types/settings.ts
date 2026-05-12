export type DashboardView = "card" | "list";

export type UserPreferences = {
  defaultJobStage: "INTERESTED" | "APPLIED" | "INTERVIEW" | "OFFER";
  dashboardView: DashboardView;
  autoArchiveRejected: boolean;
  autoArchiveRejectedDays: number;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultJobStage: "INTERESTED",
  dashboardView: "card",
  autoArchiveRejected: false,
  autoArchiveRejectedDays: 30,
};
