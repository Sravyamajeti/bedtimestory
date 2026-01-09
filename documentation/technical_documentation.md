# Technical Documentation

## 1. System Overview
Bedtime Stories is a Serverless Web Application built with **Next.js 14 (App Router)**. It leverages **Supabase** for persistence, **OpenAI** for content generation, and **Resend** for transactional emails.

## 2. Technology Stack
-   **Frontend Framework:** Next.js 14 (React Server Components, App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS (Custom configuration in `tailwind.config.ts`)
-   **Database:** Supabase (PostgreSQL)
-   **AI Engine:** OpenAI API (GPT-4o or similar)
-   **Email Service:** Resend API
-   **Hosting:** Vercel (Serverless Functions, Cron Jobs)

## 3. Database Schema
The core application relies on a single primary table in Supabase: `stories`.

### Table: `stories`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` |
| `created_at` | `timestamptz` | default `now()` |
| `title` | `text` | Story title (generated or edited) |
| `content` | `text` | Full HTML content of the story |
| `summary_bullets` | `text[]` | Array of 3 short summary points |
| `tags` | `text[]` | Array of descriptive tags (e.g., "Animals", "Space") |
| `status` | `text` | Enum: `'PENDING'`, `'APPROVED'`, `'SENT'`, `'REJECTED'` |
| `date` | `date` | Scheduled publication date |

## 4. Key Workflows

### 4.1 Daily Story Generation (Cron)
1.  **Trigger:** Vercel Cron (`vercel.json`) calls `/api/cron/generate-story`.
2.  **Process:**
    -   Validates `CRON_SECRET`.
    -   Calls OpenAI with a system prompt to generate a JSON story (title, summary, body, tags).
    -   Inserts record into `stories` table with status `PENDING`.
    -   Sends email to `ADMIN_EMAIL` with a link to `/admin/review/[id]`.

### 4.2 Admin Review
1.  **Access:** Admin clicks the secret magic link (or navigates to `/admin/review/[id]`).
2.  **Edit:** Admin can modify title, content, or tags using the UI form.
3.  **Approve:** Clicking "Approve" updates status to `APPROVED`.
4.  **Reject:** Updates status to `REJECTED`.

### 4.3 Daily Email Dispatch (Cron)
1.  **Trigger:** Vercel Cron calls `/api/cron/send-email`.
2.  **Process:**
    -   Queries `stories` for `status = 'APPROVED'`.
    -   Fetches subscriber list from Resend Audience.
    -   Sends email broadcast via Resend.
    -   Updates story status to `SENT`.

### 4.4 Public Access
-   **Landing Page (`/`):** Static/Hybrid. Captures new emails.
-   **Library (`/library`):** Fetches `SENT` or `APPROVED` stories. Supports `?tag=` filtering.
-   **Story Page (`/story/[id]`):** Dynamic SSR. Fetches story by ID.
    -   Renders SEO tags (OpenGraph, JSON-LD) on the fly.

## 5. Folder Structure
-   `/app`: Next.js App Router pages and API routes.
-   `/app/api`: Backend logic (cron jobs, subscriptions).
-   `/app/components`: Reusable UI components (buttons, headers, etc.).
-   `/lib`: Application logic (Supabase client, OpenAI wrapper, Email templates).
-   `/documentation`: Project specs and planning docs.

## 6. Environment Variables
Required variables in `.env.local` and Vercel:
-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `OPENAI_API_KEY`
-   `RESEND_API_KEY`
-   `CRON_SECRET`
-   `ADMIN_EMAIL`
-   `SENDER_EMAIL` / `SENDER_NAME`
