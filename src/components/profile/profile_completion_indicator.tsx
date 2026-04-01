import type { Profile } from "@/types/profile";

type ProfileCompletionIndicatorProps = {
  profile: Profile;
};

const requiredFields: Array<keyof Profile> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "zipCode",
  "summary",
];

export default function ProfileCompletionIndicator({
  profile,
}: ProfileCompletionIndicatorProps) {
  const completedFields = requiredFields.filter((field) => {
    const value = profile[field];
    return typeof value === "string" && value.trim() !== "";
  }).length;

  const totalFields = requiredFields.length;
  const completionPercentage = Math.round(
    (completedFields / totalFields) * 100,
  );

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Profile Completion
        </h2>
        <span className="text-sm font-medium text-gray-700">
          {completionPercentage}%
        </span>
      </div>

      <div className="h-3 w-full rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-gray-900 transition-all"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {completedFields} of {totalFields} baseline fields completed
      </p>
    </div>
  );
}