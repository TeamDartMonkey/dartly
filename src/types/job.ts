export type JobStage = "Interested" | "Applied" | "Interview" | "Offer" | "Rejected" | "Archived";

export type Job = {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  lastActivityDate: string;
  location?: string;
  description?: string;
  customNotes?: string;
  priority?: boolean;
};
