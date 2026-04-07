export type Experience = {
  id?: string;
  type: "EMPLOYMENT" | "PROJECT";
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
};

export type Education = {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

export type Skill = {
  id?: string;
  name: string;
};

export type ProfileData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  professionalLinks?: Record<string, string>;
  headline?: string;
  summary?: string;
  targetRoles: string[];
  targetLocations: string[];
  workModePreference?: string;
  salaryPreference?: number;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
};

export type CompletionField = {
  label: string;
  complete: boolean;
};
