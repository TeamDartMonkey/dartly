"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { ProfileData } from "@/types/profile";

type IdentitySectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

// RFC 5322 simplified — local@domain.tld with no whitespace
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | undefined {
  if (!value) return undefined;
  return EMAIL_REGEX.test(value) ? undefined : "Enter a valid email address";
}

function validatePhone(value: string): string | undefined {
  if (!value) return undefined;
  // Strip formatting characters; require 10-15 digits (E.164 max is 15)
  const digits = value.replace(/[\s\-().+]/g, "");
  if (!/^\d+$/.test(digits)) return "Phone can only contain digits and ()-+ . spaces";
  if (digits.length < 10 || digits.length > 15) return "Phone must be 10-15 digits";
  return undefined;
}

export function IdentitySection({ profile, onUpdate }: IdentitySectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  function openModal() {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    setLocation(profile.location ?? "");
    setEmailError(undefined);
    setPhoneError(undefined);
    setModalOpen(true);
  }

  function handleSave() {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const eErr = validateEmail(trimmedEmail);
    const pErr = validatePhone(trimmedPhone);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;

    onUpdate({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
      location: location.trim() || undefined,
    });
    setModalOpen(false);
  }

  const fields = [
    {
      label: "Name",
      value: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null,
    },
    { label: "Email", value: profile.email || null },
    { label: "Phone", value: profile.phone || null },
    { label: "Location", value: profile.location || null },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Identity & Contact</h2>
        <button
          type="button"
          onClick={openModal}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-zinc-500">{field.label}</p>
            <p className="text-zinc-50">
              {field.value || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Identity & Contact">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="identity-firstName"
              label="First Name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              id="identity-lastName"
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input
            id="identity-email"
            label="Email"
            type="email"
            placeholder="jane@example.com"
            value={email}
            error={emailError}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmail(e.target.value.trim()));
            }}
            onBlur={() => setEmailError(validateEmail(email.trim()))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="identity-phone"
              label="Phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              error={phoneError}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(validatePhone(e.target.value.trim()));
              }}
              onBlur={() => setPhoneError(validatePhone(phone.trim()))}
            />
            <Input
              id="identity-location"
              label="Location"
              placeholder="New York, NY"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
      </Modal>
    </div>
  );
}
