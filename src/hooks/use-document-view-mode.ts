"use client";

import { useEffect, useState } from "react";
import type { ViewMode } from "@/types/job";

const STORAGE_KEY = "dartly-documents-view";
const DEFAULT: ViewMode = "card";

export function useDocumentViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "card" || stored === "list") setMode(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return [mode, setMode];
}
