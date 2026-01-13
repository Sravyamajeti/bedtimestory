# Product Requirements Document (PRD): Bedtime Stories AI

## 1. Executive Summary
**Bedtime Stories** is a web application that delivers daily, magical, AI-generated bedtime stories for children. The platform ensures all content is child-safe through explicit prompts and a mandatory human-in-the-loop admin review process before publication.

## 2. Target Audience
-   **Primary:** Parents of children aged 3-10 looking for fresh, safe, and engaging bedtime stories.
-   **Secondary:** Grandparents, babysitters, and educators.

## 3. Core Features

### 3.1 AI Story Generation
-   **Engine:** OpenAI (GPT-4 or similar).
-   **Cadence:** Daily generation (Cron job).
-   **Content:** Child-safe, calming, non-violent, appropriate for sleep.
-   **Format:** Title, Summary Bullets, Full Story text, Generated Tags.
-   **Randomness:** Programmatic selection of 2-3 random categories (from ~45 preset themes) per generation to ensure variety.

### 3.2 Admin Control & Review
-   **Control Panel:** Dedicated page for manual interventions.
    -   **Manual Trigger:** Force generation of tomorrow's story immediately to bypass cron wait.
    -   **Resend Approval:** Trigger email resend for pending drafts in case of delivery failure.
    -   **Test Emails:** Send test "Welcome" and "Story" emails to verify templates.
-   **Review System:** (Existing)
    -   **Workflow:** generated stories are marked as `PENDING`.
-   **Notification:** Admin receives an email with a "Review" link.
-   **Interface:** Secure admin page to Edit Title, Content, and Tags.
-   **Action:** Admin must explicitly `APPROVE` a story for it to be published.

### 3.3 Public Library & Navigation
-   **Landing Page:** Value proposition, latest story snippet/CTA, subscription form.
-   **Library Page:** Archive of all `APPROVED` or `SENT` stories.
-   **Filtering:** Users can filter stories by tags (e.g., "Animals", "Adventure").
-   **Story Detail View:** Dedicated page for reading a full story.
-   **Search/SEO:** Pages are optimized with dynamic metadata, sitemaps, and JSON-LD schema.

### 3.4 Email Subscription
-   **Provider:** Resend.
-   **Flow:** Users enter email -> Added to audience -> Receive daily story email at 6 AM.
-   **Content:** Full story or summary with link to website.

## 4. Technical Architecture
-   **Framework:** Next.js 14+ (App Router).
-   **Database:** Supabase (PostgreSQL).
-   **Styling:** Tailwind CSS (Custom "Magical" theme: gradients, glassmorphism).
-   **Deployment:** Vercel (recommended).

## 5. Success Metrics
-   Number of active subscribers.
-   Daily Open Rates (Emails).
-   Time on Page (Reading stories).
-   SEO Rankings for "free bedtime stories".
