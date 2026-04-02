// This is the sidebar component used in layout.tsx.
// It renders the Dartly logo + the four main nav links.
// "use client" is required here because we use usePathname()
// to detect which page is active and style it differently.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// cn() is a utility already in the project (src/utils/cn.ts).
// It merges Tailwind classes cleanly so we can write conditional styles.
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Nav link definitions
// Each item has: the display label, the URL it goes to, and a simple SVG icon.
// To add a new nav item in the future, just add an entry here.
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/documents",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
] as const;

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------
export function Sidebar() {
  // usePathname() tells us which URL the user is currently on.
  // We use this to highlight the active nav link.
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 sticky top-0 h-screen"
      aria-label="Main navigation"
    >
      {/* ----------------------------------------------------------------
          Logo / Wordmark
          Clicking the logo always takes you back to the dashboard (home).
      ---------------------------------------------------------------- */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
          aria-label="Dartly — go to dashboard"
        >
          {/* Simple geometric mark — two overlapping squares */}
          <div className="relative w-7 h-7 shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-sm" />
            <div className="absolute top-1 left-1 right-0 bottom-0 border-2 border-indigo-300 rounded-sm" />
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-50 group-hover:text-indigo-400 transition-colors">
            dartly
          </span>
        </Link>
      </div>

      {/* ----------------------------------------------------------------
          Navigation links
      ---------------------------------------------------------------- */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Site sections">
        {NAV_ITEMS.map((item) => {
          // A link is "active" if the current URL starts with its href.
          // e.g. /dashboard/some-job-id still counts as Dashboard being active.
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // Base styles shared by all nav links
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                // Active state (from ui-ux-standards.md Section 5)
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 font-medium border-l-2 border-indigo-500 pl-[10px]"
                  : // Inactive state
                    "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 border-l-2 border-transparent pl-[10px]"
              )}
            >
              {/* Icon */}
              <span className="shrink-0">{item.icon}</span>
              {/* Label */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ----------------------------------------------------------------
          Bottom of sidebar — placeholder for user info / logout
          (Auth stories S1-010 through S1-015 will fill this in)
      ---------------------------------------------------------------- */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-500">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span>Account</span>
        </div>
      </div>
    </aside>
  );
}
