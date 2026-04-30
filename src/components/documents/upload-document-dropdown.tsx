"use client";

import { useEffect, useRef, useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { DocumentResponse, DocumentType } from "@/types/document";

type UploadDocumentDropdownProps = {
  onUploaded: (document: DocumentResponse) => void;
};

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "RESUME", label: "Resume" },
  { value: "COVER_LETTER", label: "Cover Letter" },
  { value: "OTHER", label: "Other" },
];

export function UploadDocumentDropdown({ onUploaded }: UploadDocumentDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<DocumentType | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(type: DocumentType) {
    setOpen(false);
    pendingTypeRef.current = type;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const type = pendingTypeRef.current;
    if (!file || !type) return;

    e.target.value = "";

    const name = file.name.replace(/\.[^/.]+$/, "");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("name", name);

    setIsUploading(true);
    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const uploaded: DocumentResponse = await res.json();
        onUploaded(uploaded);
        showToast("Document uploaded");
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error ?? "Failed to upload document", "error");
      }
    } finally {
      setIsUploading(false);
      pendingTypeRef.current = null;
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isUploading}
        className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin text-zinc-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            Upload
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full text-left px-3 py-2 text-sm text-zinc-50 hover:bg-zinc-700"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
