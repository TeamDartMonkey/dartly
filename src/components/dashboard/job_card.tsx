import type { Job } from "@/types/job";
import deleteIcon from "@/app/icon/Delete_icon.png";
import editIcon from '@/app/icon/edit.png'
import Image from "next/image";
type JobCardProps = {
    job: Job;
    onEdit?: (job: Job) => void;
    onDelete?: (id: string) => void;
};

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">

            {/* Top */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-sm text-gray-600">{job.company}</p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {job.stage}
                </span>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-1 text-sm text-gray-500">
                {job.location && <p>Location: {job.location}</p>}
                <p>Last activity: {job.lastActivityDate}</p>
            </div>

            {/* Bottom */}
            <div className="mt-4 flex items-center justify-between">
                {job.priority ? (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Priority
                    </span>
                ) : (
                    <div />
                )}

                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(job)}
                            className="rounded-md border px-3 py-1 text-xs hover:bg-gray-100"
                        >
                            <Image
                                src={editIcon}
                                alt="Edit"
                                width={20}
                                height={20}
                            />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(job.id)}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                            <Image
                                src={deleteIcon}
                                alt="Delete"
                                width={20}
                                height={20}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}