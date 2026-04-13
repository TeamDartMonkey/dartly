export type JobStage = "Interested" | "Applied" | "Interview" | "Offer" | "Rejected" | "Archived";

export type Job = {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  lastActivityDate: string;
  location?: string;
  description?: string;
  compensationNotes?: string;
  applicationDate?: string;
  deadline?: string;
  recruiterNotes?: string;
  customNotes?: string;
  priority?: boolean;
};
