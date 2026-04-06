"use client";

import { useEffect, useMemo, useState } from "react";
import { CompletionIndicator } from "@/components/profile/completion-indicator";
import { IdentitySection } from "@/components/profile/identity-section";
import { SummarySection } from "@/components/profile/summary-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { EducationSection } from "@/components/profile/education-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { CareerPreferencesSection } from "@/components/profile/career-preferences-section";
import type { ProfileData, CompletionField } from "@/types/profile";

const STORAGE_KEY = "profile_data";

const EMPTY_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  professionalLinks: {},
  headline: "",
  summary: "",
  targetRoles: [],
  targetLocations: [],
  workModePreference: "",
  salaryPreference: undefined,
  experiences: [],
  educations: [],
  skills: [],
};

function getCompletionFields(profile: ProfileData): CompletionField[] {
  return [
    { label: "First name", complete: !!profile.firstName },
    { label: "Last name", complete: !!profile.lastName },
    { label: "Email", complete: !!profile.email },
    { label: "Phone", complete: !!profile.phone },
    { label: "Location", complete: !!profile.location },
    { label: "Headline", complete: !!profile.headline },
    { label: "Summary", complete: !!profile.summary },
    { label: "Experience", complete: profile.experiences.length > 0 },
    { label: "Education", complete: profile.educations.length > 0 },
    { label: "Skills", complete: profile.skills.length > 0 },
    { label: "Target roles", complete: profile.targetRoles.length > 0 },
    { label: "Work mode", complete: !!profile.workModePreference },
  ];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile({
          ...EMPTY_PROFILE,
          ...parsedProfile,
          professionalLinks: parsedProfile.professionalLinks ?? {},
          targetRoles: parsedProfile.targetRoles ?? [],
          targetLocations: parsedProfile.targetLocations ?? [],
          experiences: parsedProfile.experiences ?? [],
          educations: parsedProfile.educations ?? [],
          skills: parsedProfile.skills ?? [],
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  }, [profile, loaded]);

  function handleUpdate(fields: Partial<ProfileData>) {
    setProfile((prev) => ({
      ...prev,
      ...fields,
    }));
  }

  const completionFields = useMemo(() => getCompletionFields(profile), [profile]);

  if (!loaded) {
    return <div className="text-sm text-zinc-400">Loading profile...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Build your profile to tailor resumes and cover letters.
        </p>
      </div>

      <div className="space-y-8">
        <CompletionIndicator fields={completionFields} />
        <IdentitySection profile={profile} onUpdate={handleUpdate} />
        <SummarySection profile={profile} onUpdate={handleUpdate} />
        <ExperienceSection
          experiences={profile.experiences}
          onUpdate={(experiences) => handleUpdate({ experiences })}
        />
        <EducationSection
          educations={profile.educations}
          onUpdate={(educations) => handleUpdate({ educations })}
        />
        <SkillsSection
          skills={profile.skills}
          onUpdate={(skills) => handleUpdate({ skills })}
        />
        <CareerPreferencesSection profile={profile} onUpdate={handleUpdate} />
      </div>
    </>
  );
}