import type { Experience } from "@/types/profile";

type ExperienceSectionProps = {
  experiences: Experience[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Experience</h2>
        <button
          type="button"
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
          disabled
        >
          Add
        </button>
      </div>

      {experiences.length === 0 ? (
        <p className="text-sm text-zinc-500">No experience added yet.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="border-l-2 border-zinc-700 pl-4">
              <p className="text-sm font-medium text-zinc-50">{exp.title}</p>
              {exp.organization && (
                <p className="text-sm text-zinc-400">{exp.organization}</p>
              )}
              <p className="text-xs text-zinc-500">
                {exp.startDate ?? "?"} &mdash; {exp.isCurrent ? "Present" : exp.endDate ?? "?"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
