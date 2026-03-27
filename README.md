# Dartly

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
- AI outputs are editable and versioned.

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

## Data Model (High-Level)

- **Entities:** User, Profile, Job, JobActivity, Document, DocumentVersion, JobDocumentLink
- **Relationships:**
  - User 1:N Job
  - User 1:N Document
  - Document 1:N DocumentVersion
  - Job N:N DocumentVersion via JobDocumentLink
  - Job 1:N JobActivity
  - User 1:1 Profile

---

## Three-Sprint Product Plan

| Sprint | Goal                                           | Key Deliverables                                                                                                     |
| ------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **1**  | Dashboard foundation, auth, profile baseline   | Dashboard shell, job CRUD, auth, profile CRUD, CI/CD setup                                                           |
| **2**  | Dashboard completion, profile completion       | Job search/filter, detail UI, document workflow, interview tracking, metrics, profile completion                     |
| **3**  | Document library, company research, deployment | Global document management, dashboard-library integration, AI-assisted company research, analytics, cloud deployment |

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Supabase, Prisma
- **Database:** PostgreSQL
- **Testing:** Vitest + Testing Library + jsdom
- **Styling:** Tailwind CSS v4
- **Linting/Formatting:** Biome
- **Authentication:** Supabase Auth (email/password; OAuth to be added)
- **AI Provider:** (TBD / integrated AI services for resume/document generation)
- **Deployment Platform:** Vercel

## CI/CD

### GitHub Actions

Automated workflows for build, test, lint, and deployment:

- **On push to main:** Runs type-check, lint, and tests before merging
- **On pull request:** Validates all checks pass before review
- **On release:** Deploys to Vercel production environment
