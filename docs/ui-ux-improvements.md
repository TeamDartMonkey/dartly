# Dartly — UI/UX Improvements

Curated from a 10-pass code review of the entire frontend. Findings are grouped by impact and roughly ordered within each group from highest to lowest.

This list is **product/design recommendations only**. Pure-correctness bugs (XSS, race conditions, schema validation, etc.) were already fixed during the review and are not repeated here.

---

## High impact

### 1. Surface settings preferences that currently do nothing

**Problem.** `dashboardView`, `defaultJobStage`, `showArchived`, `autoArchiveRejected`, and `autoArchiveRejectedDays` are exposed as toggles in `Settings → App Preferences`, persisted via `PATCH /api/settings`, and read back on page load — but **no code in the app consumes them**.

- `useViewMode` / `useDocumentViewMode` (`src/hooks/use-view-mode.ts`, `src/hooks/use-document-view-mode.ts`) read `localStorage` only.
- `DashboardPage` initializes `showArchived` from `useState(false)` — `preferences.showArchived` is ignored.
- `JobForm` defaults a new job's stage to `"Interested"` — `preferences.defaultJobStage` is ignored.
- No worker implements `autoArchiveRejected`.

**Recommendation.**
- Either thread `preferences.dashboardView` / `defaultJobStage` / `showArchived` into the relevant initial states, or remove the toggles from the UI and the schema. Silent toggles erode user trust.
- Implement (or remove) `autoArchiveRejected` — a Vercel Cron + a `POST /api/cron/auto-archive` (token-protected) that runs daily and archives rejected jobs older than `autoArchiveRejectedDays` is the smallest viable shape.

### 2. Tab switches on the job-detail page reset section state and refetch data

`src/app/(app)/dashboard/[jobId]/page.tsx:158-204` toggles tabs by mounting/unmounting each section (`activeTab === "overview" && <OverviewSection />`). Every tab switch:

- Loses in-progress edits in the previous tab's forms.
- Re-mounts `DocumentsSection`, which refetches `/api/jobs/[id]/documents` and `/api/documents` on every visit.

**Recommendation.** Keep all panels mounted but visually hidden via `hidden` or CSS, or hoist data caches with React Query / SWR so navigations don't refetch. The job-detail page is the most frequently revisited screen — the cost of always-mounted sections is minimal compared to the UX win.

### 3. PDF viewer renders all pages eagerly and has no error handler

`src/components/documents/pdf-viewer.tsx` calls `Array.from({ length: numPages }, ...)` and renders every `<Page>` synchronously. For a 30-page resume the browser allocates 30 canvases (~10–30 MB) all at once. There's no `onLoadError` on the `<Document>` either, so a network blip or expired signed URL produces blank pages with no telemetry.

**Recommendation.**
- Virtualize with `react-window` or render only the page in/near the viewport.
- Add `onLoadError` and surface a toast + a "Retry" button.
- For PDFs longer than (say) 10 pages, request a longer signed-URL TTL to avoid mid-render expiration.

### 4. Race-prone sibling editing on the profile page is technically fixed but the edit experience is fragile

`src/components/profile/identity-section.tsx`, `summary-section.tsx`, `career-preferences-section.tsx` all hold local form state initialized once at mount and re-synced in `openModal`. After a sibling section save, `setProfile(saved)` updates the parent — but the closed modal's local state is stale until the next "Edit" click.

**Recommendation.** Make these modals controlled children of the parent profile state, or add a `useEffect` keyed on `[profile, modalOpen]` that re-syncs local state when the modal is opened. Removes a class of "I edited this twice and the second edit got lost" reports.

### 5. Job-card double action area is collapsed but tab order is still awkward

`src/components/dashboard/job-card.tsx` now wraps the entire card body in a single absolute-positioned overlay button, with action icons on a higher z-index. Functional, but the keyboard tab order is: **title → action icons → stage badge → urgency chip**, which doesn't match visual order.

**Recommendation.** Wrap each card in a single `<a href="/dashboard/[jobId]">` (Next.js `<Link>`) and absolutely-position the action icons. `<a>` is the natural element for "go to detail" and gives correct keyboard, right-click ("Open in new tab"), and middle-click semantics for free.

### 6. Modals lose focus context on close

`src/components/ui/modal.tsx` was patched to restore focus to the previously-focused element on close (good). But several callers re-open the same modal from different triggers (e.g. clicking a job card vs the "Add job" button), and the focus restoration relies on `document.activeElement` at open time, which might be the page's `<body>` if the open was triggered programmatically.

**Recommendation.** Pass an explicit `returnFocusRef?: React.RefObject<HTMLElement>` prop to Modal so the trigger can dictate where focus should go on close. Falls back to current behavior if not provided.

### 7. The metrics panel shows "Stage Conversion" but doesn't let users drill in

The Analytics panel shows percentages (e.g. "Interview Rate: 67%") with no way to click through to the underlying jobs. For a power user with 50+ applications this is the most actionable view, but it's read-only.

**Recommendation.** Make each funnel row clickable — clicking "Applied (12)" should filter the dashboard to those 12 jobs. This is a one-line change to navigate with `?stage=Applied` and have the filter-bar pre-populate.

---

## Medium impact

### 8. Date/time pickers don't preserve the user's previous picks across opens

`src/components/ui/date-picker.tsx` resets internal navigation state each open. If a user is logging interviews from October and accidentally closes the picker, reopening jumps back to "today" instead of October.

**Recommendation.** Persist the last-viewed month in component-internal state until the picker is unmounted (form is closed/saved).

### 9. AI generation has no progress signal beyond "Generating..."

`generateResumeDraft` and `generateCoverLetterDraft` can take 5–30 seconds. Currently the button text is the only feedback. A user with a slow connection sees a stalled-looking button and may double-tap (now blocked by a guard, but still confusing).

**Recommendation.**
- Add a streaming animation (pulsing dot or progress bar) inside the button.
- Show an estimate ("Usually takes 10–20 seconds") for the first generation.
- For research/cover-letter (>15s typical), consider Server-Sent Events or polling so the user sees partial output.

### 10. Empty states are inconsistent across pages

Some pages have rich empty states ("No jobs yet. Add your first job."), others render `null` or an empty box. Notably:
- `metrics-panel` returns `null` when there are no jobs — the dashboard then shows just the filter bar without any guidance.
- `documents-section` on a job with no documents shows just an "Add" button, no contextual help.
- `interviews-section` / `followups-section` empty states are minimal text.

**Recommendation.** Standardize on the pattern in `JobList` (icon + 1-line description + primary action button). Document the pattern in `docs/ui-ux-standards.md`.

### 11. Toast messages don't differentiate error severity

All errors use the same red toast: a 500 from the AI service looks identical to "Title is required" client-side validation.

**Recommendation.** Reserve red for genuine errors. Use yellow for actionable warnings (e.g. "Profile is required to generate a resume — go to Profile"). Use a "Retry" button on toasts that result from network/timeout errors.

### 12. The dashboard filter bar always lives at the top of the page

When a user has scrolled halfway through 50 jobs, changing the filter scrolls them back to the top because `JobList` re-renders with a new array. The filter bar is also not sticky.

**Recommendation.** Make the filter bar sticky on scroll (`position: sticky; top: 0;`) so it's always reachable without scroll-jumping.

### 13. Document detail has three view modes (preview/markdown/edit) with subtle distinctions

`Preview`, `Markdown`, and `Edit` all render the same content but differently. New users won't immediately understand the distinction (markdown source vs. rendered preview).

**Recommendation.**
- Rename "Markdown" → "Source" or "Raw" for clarity.
- Add tooltips on each tab.
- Consider collapsing to a single split view for power users (preview on the right, edit on the left).

### 14. The job detail page doesn't show a stage history timeline

`JobStageHistory` rows are written on every transition but only consumed by metrics. The user has no in-app way to see "When did I move this from Applied → Interview?"

**Recommendation.** Add a small "Stage history" line under the stage badge: "Applied (3 weeks ago) → Interview (5 days ago)". The data already exists.

### 15. Profile completion indicator doesn't link to the missing fields

`CompletionIndicator` shows "8 of 14 complete" but a user has to scan every section to find the gaps.

**Recommendation.** Each incomplete chip should be a link/button that scrolls to the relevant section and (ideally) opens its edit modal.

---

## Low impact

### 16. Loading skeletons don't match the post-load layout

`DashboardSkeleton` renders four stacked rows but the actual `JobList` in card view is a 3-column grid above a metrics panel. The mismatch causes visible CLS on every dashboard load.

**Recommendation.** Make each skeleton mirror its real-content shape: card grid with 6 placeholder cards, metrics-panel placeholder above.

### 17. Edit/Delete glyphs use Unicode characters (`✎`, `✕`)

Across `job-card`, `job-list-item`, `experience-section`, `skills-section`. They render differently per OS/font (sometimes as outlined, sometimes filled), and some screen readers double-announce them ("pencil" + the aria-label).

**Recommendation.** Replace with the SVG icon set already in use elsewhere (Feather/Lucide-style strokes). Wrap any remaining glyphs in `<span aria-hidden="true">`.

### 18. Drag-to-reorder in profile sections has no keyboard alternative

`experience-section.tsx` and `skills-section.tsx` use HTML5 drag handles. Keyboard-only users can't reorder anything.

**Recommendation.** Add up/down arrow buttons next to each row, or use `dnd-kit` which has built-in keyboard support.

### 19. Salary-preference input accepts only integers, no formatting

The salary input in `career-preferences-section.tsx` is a raw `<input type="number">`. Users typing `120000` see no thousands separator until after save.

**Recommendation.** Format on blur ("$120,000"), parse on focus. Or use a locale-aware number input.

### 20. Markdown rendering does not show "Show more" for long content

The document detail preview renders the entire document content in one scrollable container. For a 5-page resume the user must scroll inside an inner container, which conflicts with the page's outer scroll.

**Recommendation.** Either remove the inner scroll (let content flow naturally) or add a sticky "Back to top" affordance inside the preview.

### 21. Color-coded stage badges may not meet WCAG AA contrast in some combinations

Several `STAGE_STYLES` colors (e.g. `bg-yellow-950 text-yellow-400`) are at the edge of contrast guidelines for 12px text. Has not been formally audited.

**Recommendation.** Run an automated contrast check (axe, Lighthouse, or `@axe-core/cli`) and adjust any failing combinations. Adopting CSS variables for stage colors would make this a one-place fix.

### 22. Activity timeline doesn't group by date

Notes, follow-ups, and interviews are interleaved by `scheduledAt` but each row repeats the date. For a job with 20 activities the timeline becomes hard to scan.

**Recommendation.** Group by day with sticky day headers (e.g. "Today", "Yesterday", "May 9"). Use `date-fns` (already a dependency) for relative grouping.

### 23. Settings page uses single-column layout regardless of viewport

Even at 1920×1080, the settings panels stack vertically with lots of empty space on the right.

**Recommendation.** Use a 2-column layout at `lg:` breakpoint (Account on the left, Preferences on the right) so the page feels denser at desktop sizes.

### 24. Confirm-delete modal doesn't preview what gets deleted alongside

Deleting a job cascades to `JobActivity`, `JobStageHistory`, and `JobDocumentLink` rows. The user sees only "Delete this job?" with no count of activities/documents that will be removed.

**Recommendation.** Show a brief summary: "This will also remove 5 activities and unlink 2 documents."

### 25. Sidebar nav doesn't show active state for nested routes

Visiting `/dashboard/job-123` doesn't highlight the "Dashboard" sidebar item because the active-state check is exact-match.

**Recommendation.** Match by prefix (`pathname.startsWith("/dashboard")`) so the sidebar correctly indicates the current section.

---

## Quick wins (≤1 hour each)

- **Add `autoComplete="given-name"` / `"family-name"` / `"tel"` etc.** to profile identity inputs so password managers and browser autofill work.
- **Add a "Copy email" affordance** on the settings Account section instead of just displaying the address.
- **Replace the literal `&larr;` back arrow** in `documents/[id]/page.tsx` with the SVG chevron used elsewhere.
- **Disable the "Save" button** when the form is unchanged (most edit modals already do this; identity-section and summary-section don't).
- **Add page titles via `metadata` exports** — currently every page in `(app)/` is just "Dartly" in the browser tab.
- **Increase font size of small meta text** (`text-xs` 12px) on cards. WCAG recommends 14px minimum for body text.
- **Add a global keyboard shortcut to add a job** (e.g. `n` or `Cmd+K`-style command palette).
- **Show a "Saved" timestamp** next to long-form fields like prep notes and research notes (currently you only see a toast that fades).
- **Sort sidebar items consistently** with the order users encounter them (Dashboard → Documents → Profile → Settings, which it already does — but verify on mobile).

---

## Non-goals / explicitly out of scope

- **No theme switcher.** The app is dark-first by intentional design (`docs/ui-ux-standards.md`).
- **No mobile-first redesign.** Mobile is supported but the primary use case is desktop, where a job seeker is typing notes between interviews.
- **No real-time collaboration.** Single-user app; no need for presence indicators or multi-cursor support.
- **No internationalization.** All strings are English-only by current design decision.
