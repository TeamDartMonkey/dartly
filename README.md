# Dartly

[![CI](https://github.com/TeamDartMonkey/dartly/actions/workflows/ci.yml/badge.svg)](https://github.com/TeamDartMonkey/dartly/actions/workflows/ci.yml)

---

## Project Overview

**ATS for Candidates** is a candidate-facing application tracking system designed to give job seekers the same organizational and workflow tools that employers use. The app consolidates job applications, documents, and interview tracking in a single platform, replacing fragmented spreadsheets, notes, and job boards.

**Target Users:**

- Job seekers at any career stage.
- Primarily graduating CS students, but applicable to all professions.

**Platform:** SaaS web application supporting multiple concurrent users with private, account-scoped data.

---

## Core Features

### 1. Dashboard / Job Board (Central Hub)

- Add, edit, archive, and update job entries.
- Move jobs through pipeline stages: Interested → Applied → Interview → Offer → Rejected → Archived.
- Expand job cards for details: documents, interviews, notes, and status tracking.
- Search, filter, and sort jobs.
- View metrics and activity timelines.

### 2. User Profile

- Maintain personal and professional information.
- Sections include: Identity, Professional Summary, Experience, Education, Skills, Career Preferences.
- Profile completion indicators and validations.
- Provides data for document generation workflows.

### 3. Document Library

- Manage resumes and cover letters (upload, create, version, tag, archive/restore).
- Link document versions to jobs.
- Global view with filters and search.
- AI-assisted drafting and tailoring of documents.

### 4. AI Features

- Resume bullet rewriting.
- Job-specific resume and cover letter generation.
- Suggest improvements for user-written content.
- AI-generated company research (overview, culture, news, role fit, suggested interview questions) — auto-saved per job.
- AI outputs are editable and versioned.

### 5. Interview Prep Notes

- Structured freeform notes per job: STAR stories, questions to ask interviewers, and talking points.
- Saved alongside job data, separate from AI-generated research.

---

## Non-Functional Requirements

- **Security:** Password hashing, account isolation, route protection.
- **Reliability:** Stable CRUD operations and document generation.
- **Performance:** Fast page loads under demo conditions.
- **Usability:** Consistent layout, clear error messages, accessible navigation.
- **Testing:** Comprehensive unit tests including edge cases, validation, and authorization.
- **CI/CD:** Automated pipelines for build, test, and deployment checks.
- **Deployment:** Cloud-accessible production app.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project with PostgreSQL database

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:

```bash
bun install
```

4. Apply database migrations:

```bash
bun prisma migrate dev
```

5. Start the dev server:

```bash
bun dev
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Developer Reference](docs/developer-reference.md) | Tech stack, CI/CD pipeline, scripts, and data model |
| [Engineering & Coding Standards](docs/engineering-coding-standards.md) | Code style, API patterns, testing, service layer |
| [Data & Security Guardrails](docs/data-security-guardrails.md) | Auth, RLS policies, security checklist |
| [UI/UX Standards](docs/ui-ux-standards.md) | Design system, color palette, component specs |
| [AI Prompting & Review Standards](docs/ai-prompting-review-standards.md) | AI workflow, code review standards, attribution |
