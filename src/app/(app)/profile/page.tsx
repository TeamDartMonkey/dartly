"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CareerPreferencesSection } from "@/components/profile/career-preferences-section";
import { CompletionIndicator } from "@/components/profile/completion-indicator";
import { EducationSection } from "@/components/profile/education-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { IdentitySection } from "@/components/profile/identity-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { SummarySection } from "@/components/profile/summary-section";
import type { CompletionField, ProfileData } from "@/types/profile";

const EMPTY_PROFILE: ProfileData = {
  targetRoles: [],
  targetLocations: [],
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
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === "object") {
          setProfile((prev) => ({ ...EMPTY_PROFILE, ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpdate(fields: Partial<ProfileData>) {
    const merged = { ...profile, ...fields };
    setProfile(merged);

    const payload = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v === undefined ? null : v])
    );
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.ok) {
      const saved: ProfileData = await res.json();
      setProfile((prev) => ({
        ...prev,
        ...saved,
        experiences: prev.experiences,
        educations: prev.educations,
        skills: prev.skills,
      }));
    } else {
      setProfile(profile);
    }
  }

  const completionFields = useMemo(() => getCompletionFields(profile), [profile]);

  if (loading) {
    return <div className="text-sm text-zinc-500">Loading...</div>;
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
        <SkillsSection skills={profile.skills} onUpdate={(skills) => handleUpdate({ skills })} />
        <CareerPreferencesSection profile={profile} onUpdate={handleUpdate} />
      </div>
    </>
  );
}
