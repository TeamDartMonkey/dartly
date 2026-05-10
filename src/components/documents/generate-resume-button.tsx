"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  jobId: string;
  onGenerated?: (documentId: string) => void;
};

export function GenerateResumeButton({ jobId, onGenerated }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        // Defensive — the body may not be JSON (5xx can return HTML).
        const data = await res.json().catch(() => ({}) as { error?: string });
        setError(data.error || `Failed to generate resume (${res.status})`);
        return;
      }

      const doc = await res.json();
      onGenerated?.(doc.id);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium"
      >
        {loading ? "Generating..." : "Generate Resume"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
