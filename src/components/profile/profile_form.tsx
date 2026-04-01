"use client";

import { useEffect, useState } from "react";
import ProfileCompletionIndicator from "@/components/profile/profile_completion_indicator";
import type { Profile } from "@/types/profile";

type ProfileFormProps = {
    onSave?: (profile: Profile) => void;
};

const defaultProfile: Profile = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    summary: "",
};

const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
];

export default function ProfileForm({ onSave }: ProfileFormProps) {
    const [form, setForm] = useState<Profile>(defaultProfile);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const storedProfile = localStorage.getItem("profile");
            if (storedProfile) {
                setForm(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error("Failed to load profile from localStorage", error);
            localStorage.removeItem("profile");
        }
    }, []);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setSaved(false);
    }

    function handlePhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/\D/g, "").slice(0, 10);

        const formatted =
            value.length <= 3
                ? value
                : value.length <= 6
                    ? `(${value.slice(0, 3)}) ${value.slice(3)}`
                    : `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;

        setForm((current) => ({
            ...current,
            phone: formatted,
        }));

        setSaved(false);
    }

    function handleZipCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/\D/g, "").slice(0, 5);

        setForm((current) => ({
            ...current,
            zipCode: value,
        }));

        setSaved(false);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        localStorage.setItem("profile", JSON.stringify(form));
        onSave?.(form);
        setSaved(true);
    }

    return (
        <>
            <ProfileCompletionIndicator profile={form} />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full rounded-lg border border-gray-300 p-2"
                        required
                    />
                    <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full rounded-lg border border-gray-300 p-2"
                        required
                    />
                </div>

                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full rounded-lg border border-gray-300 p-2"
                    required
                />

                <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="(123) 456-7890"
                    className="w-full rounded-lg border border-gray-300 p-2"
                />

                <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street Address"
                    className="w-full rounded-lg border border-gray-300 p-2"
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full rounded-lg border border-gray-300 p-2"
                    />

                    <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full rounded-lg border border-gray-300 p-2"
                        list="state-options"
                    />

                    <datalist id="state-options">
                        {states.map((state) => (
                            <option key={state} value={state} />
                        ))}
                    </datalist>

                    <input
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleZipCodeChange}
                        placeholder="ZIP Code"
                        className="w-full rounded-lg border border-gray-300 p-2"
                        inputMode="numeric"
                    />
                </div>

                <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    placeholder="Professional Summary"
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 p-2"
                />

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Save Profile
                    </button>

                    {saved && <p className="text-sm text-green-600">Profile saved.</p>}
                </div>
            </form>
        </>
    );
}