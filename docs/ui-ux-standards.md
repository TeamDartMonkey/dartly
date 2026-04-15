# Dartly UI/UX Standards

**Sprint 1 Context Document — S1-002**  
_All team members must read this before building any UI. Update this doc if decisions change._

---

## 1. Design Philosophy

Dartly is a professional productivity tool for job seekers. The UI should feel **clean, trustworthy, and focused** — similar to Notion or a modern SaaS dashboard. It should never feel cluttered, playful, or experimental.

Three guiding principles:

1. **Clarity over cleverness** — the user should always know where they are and what to do next.
2. **Consistency over creativity** — every page should feel like it belongs to the same app.
3. **Content first** — UI chrome (navigation, borders, decorations) should recede; user data should stand out.

---

## 2. Color Palette

> ⚠️ The repo is configured with a dark theme. These colors are based on `#09090b` background with monospace typography.

### Primary Colors

| Role | Name | Hex | Tailwind Class |
|---|---|---|---|
| Brand / Primary | Indigo | `#6366F1` | `bg-indigo-500` |
| Primary Hover | Indigo Dark | `#4F46E5` | `bg-indigo-600` |
| Background | Near Black | `#09090b` | `bg-zinc-950` |
| Surface (cards, panels) | Zinc 900 | `#18181B` | `bg-zinc-900` |
| Border | Zinc 700 | `#3F3F46` | `border-zinc-700` |

### Text Colors

| Role | Hex | Tailwind Class |
|---|---|---|
| Primary text | `#FAFAFA` | `text-zinc-50` |
| Secondary text | `#A1A1AA` | `text-zinc-400` |
| Disabled / placeholder | `#71717A` | `text-zinc-500` |
| Link / interactive | `#818CF8` | `text-indigo-400` |

### Status / Semantic Colors

These are used for pipeline stage badges, alerts, and status indicators. Adjusted for dark backgrounds.

| Status | Hex | Tailwind |
|---|---|---|
| Success / Offer | `#4ADE80` | `text-green-400` / `bg-green-950` |
| Warning / Interview | `#FACC15` | `text-yellow-400` / `bg-yellow-950` |
| Info / Applied | `#60A5FA` | `text-blue-400` / `bg-blue-950` |
| Neutral / Interested | `#A1A1AA` | `text-zinc-400` / `bg-zinc-900` |
| Danger / Rejected | `#F87171` | `text-red-400` / `bg-red-950` |
| Muted / Archived | `#52525B` | `text-zinc-600` / `bg-zinc-900` |

### What to avoid

- Do not use pure white (`#FFFFFF`) for text on dark backgrounds — use `text-zinc-50` or `text-zinc-100`.
- Do not use multiple competing accent colors. Indigo is the one brand color.
- Do not use bright whites or light grays for backgrounds — they break the dark theme.
- Do not use low-contrast colors that are hard to read on the dark background.

---

## 3. Typography

> ⚠️ The repo uses Geist Mono as the primary font family, set in `layout.tsx`.

**Font family:** Geist_Mono (monospace) or fallback to system monospace fonts.

```css
font-family: var(--font-geist-mono), ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
```

### Type Scale

| Use | Size | Weight | Tailwind |
|---|---|---|---|
| Page title (H1) | 24px | Semibold (600) | `text-2xl font-semibold` |
| Section heading (H2) | 18px | Semibold (600) | `text-lg font-semibold` |
| Subsection (H3) | 16px | Medium (500) | `text-base font-medium` |
| Body text | 14px | Regular (400) | `text-sm` |
| Small / label | 12px | Regular (400) | `text-xs` |
| Badge / tag | 12px | Medium (500) | `text-xs font-medium` |

### Rules

- Use `font-semibold` for headings only — not for emphasis in body text.
- Use `text-gray-500` for secondary info (dates, metadata, labels).
- Never use more than two font weights on a single page.

---

## 4. Spacing and Layout

**Base unit:** 4px (Tailwind's default spacing scale — `p-1` = 4px, `p-4` = 16px, etc.)

### Page Layout

All pages use the same shell:
- **Sidebar navigation** on the left (fixed, not scrollable)
- **Main content area** on the right, scrollable
- Max content width: `max-w-5xl` (1024px) centered in the main area

### Content Spacing

| Context | Rule |
|---|---|
| Page top padding | `pt-8` (32px) |
| Section gap (between major sections) | `gap-8` or `mb-8` |
| Card internal padding | `p-6` (24px) |
| Form field gap | `gap-4` or `space-y-4` |
| Inline element gap | `gap-2` (8px) |

### Responsive Behavior

- Mobile support is **not required for Sprint 1** but do not use fixed pixel widths that would break obviously at smaller sizes.
- Use `flex` and `gap` over `margin` for layout spacing wherever possible.

---

## 5. Navigation

### Structure

Global navigation is a **left sidebar** with four links:

1. Dashboard (home — default route `/dashboard`)
2. Document Library (`/documents`)
3. Profile (`/profile`)
4. Settings (`/settings`)

The Dartly logo or wordmark sits at the top of the sidebar above the nav links.

### Active State

The active/current route link should be visually distinguished:
- Background: `bg-indigo-50`
- Text: `text-indigo-600 font-medium`
- Left border accent: `border-l-2 border-indigo-500` (optional but recommended)

### Inactive State

- Text: `text-gray-600`
- Hover: `hover:bg-gray-100 hover:text-gray-900`

### Rules

- Navigation must be identical on every page — do not hide or change nav items per page.
- Navigation is implemented in `src/app/(app)/layout.tsx` (the shared protected layout) via the `Sidebar` component.
- Do not add page-specific items to the global nav. Secondary navigation (tabs, sub-nav) lives inside the page.

---

## 6. Components

### Buttons

Three variants only:

| Variant | Use | Classes |
|---|---|---|
| Primary | Main CTA (save, create, submit) | `bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium` |
| Secondary | Alternative actions | `bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium` |
| Destructive | Delete, remove, archive | `bg-red-600 hover:bg-red-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium` |

- All buttons use `rounded-md` (not `rounded-full` or sharp).
- Disabled state: `opacity-50 cursor-not-allowed`.
- Do not create custom button styles. Use these three.

### Cards

Cards are the primary container for content blocks (job cards, profile sections, etc.).

```
bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6
```

- Use `shadow-sm` only — not `shadow-md` or larger.
- Cards sit on the `bg-zinc-950` page background for contrast.
- Do not nest cards inside cards.

### Form Inputs

```
bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm w-full text-zinc-50
focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
```

- Labels always sit **above** the input, never inside or to the side.
- Label style: `text-sm font-medium text-zinc-300 mb-1`
- Error state: `border-red-500` with an error message in `text-xs text-red-400` below the field.
- Required fields are marked with an asterisk in the label: `Title *`

### Badges / Pipeline Stage Tags

Used for job pipeline stages and status labels.

```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
```

Apply the semantic colors from Section 2 (e.g., `bg-blue-100 text-blue-600` for "Applied").

### Empty States

When a section has no data yet (e.g., no jobs on the dashboard), show a centered empty state:
- Icon (optional, subtle gray)
- Short heading: e.g., "No jobs yet"
- One-line subtext: e.g., "Add your first job to get started."
- Primary action button if applicable

---

## 7. Page-Specific Notes

### Dashboard

- Job cards are displayed in a **grid or list** (team decides, but be consistent).
- The pipeline stage badge is always visible on the card without expanding.
- Metrics/stats (when implemented) sit at the top of the dashboard above the job board.

### Settings

- Use a simple vertical list of sections with `<h2>` headings and card containers.
- No sidebar within Settings — keep it flat.

### Profile

- Each profile section (Identity, Summary, Experience, etc.) is its own card.
- Use an "Edit" button per card that toggles a form inline — do not navigate to a separate edit page.

---

## 8. Accessibility Minimums

- All form inputs must have a `<label>` with a matching `htmlFor` / `id`.
- Color alone must not be the only indicator of state — always pair color with text or an icon.
- Interactive elements must be keyboard-reachable (buttons and links, not `div` click handlers).
- Minimum contrast ratio: 4.5:1 for body text (the palette in Section 2 meets this).

---

## 9. What NOT to Do

- ❌ Do not use `<div onClick>` instead of `<button>` for clickable elements.
- ❌ Do not invent new color values outside the palette — use the defined Tailwind classes.
- ❌ Do not use `shadow-lg` or `shadow-xl` — keeps the UI light and flat.
- ❌ Do not put navigation items in the page body.
- ❌ Do not use more than one H1 per page.
- ❌ Do not add animations or transitions in Sprint 1 — focus on structure first.

---

## 10. Updating This Document

1. Update this file directly in the `docs/` folder.
2. Note the change with a short comment (e.g., `# Updated in Sprint 2: switched font to DM Sans`).
3. Let the team know in your group chat.

This document is a living reference, not a locked spec.
