"use client";

import { useState } from "react";
import type { ProfileData } from "@/types/profile";

type IdentitySectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

export function IdentitySection({ profile, onUpdate }: IdentitySectionProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [location, setLocation] = useState(profile.location ?? "");

  function handleSave() {
    onUpdate({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    });
    setEditing(false);
  }

  function handleCancel() {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    setLocation(profile.location ?? "");
    setEditing(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Identity & Contact</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputStyles}
                placeholder="Jane"
              />
            </div>
            <div>
              <label className={labelStyles} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputStyles}
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className={labelStyles} htmlFor="profileEmail">Email</label>
            <input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyles}
              placeholder="jane@example.com"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles} htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputStyles}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className={labelStyles} htmlFor="profileLocation">Location</label>
              <input
                id="profileLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputStyles}
                placeholder="New York, NY"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Name</p>
            <p className="text-zinc-50">
              {profile.firstName || profile.lastName
                ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                : <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Email</p>
            <p className="text-zinc-50">
              {profile.email || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Phone</p>
            <p className="text-zinc-50">
              {profile.phone || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Location</p>
            <p className="text-zinc-50">
              {profile.location || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
