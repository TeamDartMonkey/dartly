"use client";

import ProfileForm from "@/components/profile/profile_form";
import type { Profile } from "@/types/profile";

export default function ProfilePage() {
  function handleSave(profile: Profile) {
    console.log("Saved profile:", profile);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your identity, contact details, and professional summary.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ProfileForm onSave={handleSave} />
        </div>
      </div>
    </main>
  );
}