# Enablement.ch — Site

Marketing site for Enablement.ch. Astro + Vercel. Deploys on every push to `main`.

**Design system:** https://github.com/MarcusAurelian/enablement-design-system

## Stack

- [Astro](https://astro.build) — static site, components, markdown content collections
- Sofia Sans (Google Fonts) + JetBrains Mono
- Crimson `#E11E48` accent on cool off-white canvas
- Light + dark mode via semantic CSS custom properties

## Structure

```
src/
├── components/        # Reusable Astro components (Hero, Workflow, LogoWall, etc.)
├── content/
│   └── case-studies/  # Markdown files, one per case study
├── content.config.ts  # Schema for case studies frontmatter
├── layouts/
│   └── BaseLayout.astro  # HTML shell, fonts, theme toggle
├── pages/
│   ├── index.astro       # Homepage
│   └── customer-results/
│       ├── index.astro   # List
│       └── [...slug].astro  # Detail template
└── styles/
    └── global.css     # All design system tokens + components
```

## Commands

| Command            | Action                                           |
| :----------------- | :----------------------------------------------- |
| `npm install`      | Install dependencies                             |
| `npm run dev`      | Local dev server at `localhost:4321`             |
| `npm run build`    | Production build to `./dist/`                    |
| `npm run preview`  | Preview production build locally                 |

## Case Study Blueprint

Use the CondenZero page as the canonical structure for future case studies:
`src/content/case-studies/condenzero.md` plus the shared detail template at
`src/pages/customer-results/[...slug].astro`.

The file slug becomes the URL: `src/content/case-studies/acme.md` publishes to
`/customer-results/acme/` when `live: true`.

### Required Flow

1. Hero headline
2. Testimonial video
3. KPI strip
4. Main customer quote
5. Challenge prose, with optional small customer quote
6. Solution prose
7. Results prose, with the final KPI recap embedded in Results
8. Outcome prose
9. Shared final CTA form

### Content Pattern

```yaml
---
company: Acme
logo: /logos/acme-black.png
result: $1.2M in pipeline from one motion
headline: How Acme generated $1.2 million in pipeline from one motion
outcome: One sentence explaining what system we built.
subhead: Optional hero context sentence.

metrics:
  - value: "650"
    label: People reached
  - value: "22"
    label: Meetings booked
  - value: "$2.4M"
    label: Pipeline generated
  - value: "$300K"
    label: Deal closed

featuredQuote:
  text: "Main customer testimonial."
  attribution: Customer Name
  detail: Founder, Acme

person:
  name: Customer Name
  title: Founder
  photo: /team/customer-name.jpg

videoTestimonial: https://player.vimeo.com/video/...

challenge:
  title: One-line challenge in buyer language.
  paragraphs:
    - First paragraph.
    - Second paragraph.
  quote:
    text: "Optional customer wording of the challenge."
    attribution: Customer Name
    detail: Founder, Acme

solution:
  title: One-line description of what we built.
  paragraphs:
    - First paragraph.
    - Second paragraph.

results:
  title: One-line outcome, not "What changed".
  paragraphs:
    - First paragraph.
    - Second paragraph.

summaryMetrics:
  - value: "650"
    label: People reached
  - value: "22"
    label: Meetings booked
  - value: "$2.4M"
    label: Pipeline generated
  - value: "$300K"
    label: Deal closed

outcomeSection:
  title: One-line wrap-up outcome.
  paragraphs:
    - First paragraph.
    - Second paragraph.

cta:
  label: Book a GTM session
  href: /book
live: true
publishedAt: 2026-07-13
featured: true
---
```

### Rules

- Keep body sections prose-first. Do not use bullets in the rendered story.
- Use specific H2s, never generic headings like `What we built` or `What changed`.
- Put the final KPI recap inside `03 / Results`, not as a separate section.
- Keep the hero and Results KPI labels consistent unless there is a clear reason to differ.
- Store customer photos locally under `public/team/` and reference them as `/team/name.jpg`.
- Use a Vimeo player URL for `videoTestimonial`, not a raw embed block.
- Run `npm run build` before pushing.
