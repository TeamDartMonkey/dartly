import type { Skill } from "@/types/profile";

type SkillsSectionProps = {
  skills: Skill[];
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Skills</h2>
        <button
          type="button"
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
          disabled
        >
          Add
        </button>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-zinc-500">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md px-3 py-1 text-xs font-medium"
            >
              {skill.name}
              {skill.proficiency && (
                <span className="ml-1 text-zinc-500">({skill.proficiency})</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
