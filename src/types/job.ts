export type JobStage =
  | "Interested"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Ghosted"
  | "Archived";

export type Job = {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  lastActivityDate: string;
  createdAt: string;
  location?: string;
  description?: string;
  compensationNotes?: string;
  applicationDate?: string;
  deadline?: string;
  recruiterNotes?: string;
  customNotes?: string;
  priority?: boolean;
  companyResearch?: string;
  prepNotes?: string;
};

export type ViewMode = "card" | "list";
