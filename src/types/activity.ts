export interface JobActivity {
  id: string;
  jobId: string;
  type: "INTERVIEW" | "FOLLOWUP" | "NOTE" | "STAGE" | "APPLIED" | "OUTCOME";
  title: string;
  description: string | null;
  scheduledAt: string | null;
  roundType: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}