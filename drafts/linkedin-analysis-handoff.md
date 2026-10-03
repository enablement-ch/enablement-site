# LinkedIn Analysis handoff - 2026-10-03

## User expectation

Submitting the public form should show progress immediately, then display a
useful competitor content analysis on the website when generation completes.
The user expected seconds; measured API calls suggest a credible full run will
take minutes. Do not promise an instant result without testing the full run.

## Current production state

- `main` at `b2a19a4` has a public form at `/resources/linkedin-analysis`.
- The form posts data to the dedicated Clay webhook and returns a success
  notification. It does **not** generate or host a report. This caused the
  user's confusion.
- The report page template and manual publisher exist, but no prospect report
  has been published.
- One real user submission was reported. The webhook is write-only from this
  workspace, so the submitted row has not been read. Ask for Clay table access
  or the submitted company domain and LinkedIn URL before producing that report.
- There were also marked QA submissions. Do not mistake them for a prospect.

## Saved work on this branch

The unshipped code adds a unique report slug to each new intake payload, a
status URL, and a frontend redirect. It does **not** implement the status page,
generation, storage, or results. Do not merge this branch as it stands.

## Findings for the next build

- The `content-lead-magnet-competitor-analysis` skill under
  `~/.codex/skills/` defines quality rules: verify real competitors, compare
  individual voices with individuals, use public post engagement rather than
  invented reach, and choose credible unclaimed buyer topics.
- A representative four-call slice took about 23 seconds. PDF rendering took
  about 2.6 seconds. Discovery and judgement are the bottlenecks.
- Local company configuration has AI Ark and Fresh LinkedIn keys in
  `~/.claude/settings.json`, plus an OpenAI API key in `enablement-gtm/.env`.
  Do not commit keys or print them.
- Vercel CLI is logged out on this Mac. Production secrets and a durable result
  store need configuration before an automated job can be deployed.
- Clay webhook delivery confirms receipt only. It does not run the analysis or
  return the submitted row.

## Next work

1. Build a real progress-and-results flow, with honest time estimates and an
   error/retry path. The report must appear on the page after completion.
2. Add a durable job/result store or another reliable recovery mechanism so a
   visitor can return to their result after closing the tab.
3. Validate competitor discovery and report quality on Enablement before
   exposing the tool. Prefer a small pilot and guard the Fresh LinkedIn quota.
4. Configure server-side API keys in Vercel. Keep them out of browser code and
   the public Git repository.
5. Locate and fulfill the user's one real request once its submitted domain and
   LinkedIn URL are available.
6. Restore the Tools menu entry only after the end-to-end result flow passes on
   production.

The public page is being temporarily removed from the menu and sitemap on
`main`. Do not undo that pause until the flow works.
