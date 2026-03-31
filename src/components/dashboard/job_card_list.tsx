import JobCard from "@/components/dashboard/job_card";
import type { Job } from "@/types/job";

type JobCardListProps = {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
};

export default function JobCardList({ jobs, onEdit, onDelete }: JobCardListProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
        No jobs found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
