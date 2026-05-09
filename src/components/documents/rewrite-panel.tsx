"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  documentId: string;
  onAccept?: () => void;
};

export function RewritePanel({ documentId, onAccept }: Props) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleRewrite() {
    if (!instruction.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, instruction }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to rewrite");
        return;
      }

      const data = await res.json();
      setOriginal(data.original);
      setRewritten(data.rewritten);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!rewritten) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rewritten }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        setOriginal(null);
        setRewritten(null);
        setInstruction("");
        onAccept?.();
        return;
      }

      // Surface non-ok responses so the user knows the accept failed instead
      // of silently leaving the panel open with the rewrite still on screen.
      const data = await res.json().catch(() => ({}) as { error?: string });
      setError(data.error || "Failed to save rewrite");
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleReject() {
    setOriginal(null);
    setRewritten(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Make more concise, Add more detail, Use formal tone..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleRewrite}
          disabled={loading || !instruction.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
        >
          {loading ? "Rewriting..." : "Rewrite"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {original && rewritten && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-400">Original</h4>
              <div className="max-h-80 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-800/50 p-3 text-sm text-zinc-300 whitespace-pre-wrap">
                {original}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-400">Rewritten</h4>
              <div className="max-h-80 overflow-y-auto rounded-md border border-indigo-500/30 bg-zinc-800/50 p-3 text-sm text-zinc-300 whitespace-pre-wrap">
                {rewritten}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              {saving ? "Saving..." : "Accept"}
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="border border-zinc-600 hover:border-zinc-500 text-zinc-300 px-4 py-2 rounded-md text-sm font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
