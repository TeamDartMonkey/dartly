import type { Education } from "@/types/profile";

type EducationSectionProps = {
  educations: Education[];
};

export function EducationSection({ educations }: EducationSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Education</h2>
        <button
          type="button"
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
          disabled
        >
          Add
        </button>
      </div>

      {educations.length === 0 ? (
        <p className="text-sm text-zinc-500">No education added yet.</p>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div key={edu.id} className="border-l-2 border-zinc-700 pl-4">
              <p className="text-sm font-medium text-zinc-50">{edu.institution}</p>
              {(edu.degree || edu.fieldOfStudy) && (
                <p className="text-sm text-zinc-400">
                  {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
                </p>
              )}
              {(edu.startDate || edu.endDate) && (
                <p className="text-xs text-zinc-500">
                  {edu.startDate ?? "?"} &mdash; {edu.endDate ?? "?"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
