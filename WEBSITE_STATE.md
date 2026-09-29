# Website conversation state

Last updated: 2026-09-29

## Current status

- Production site: https://www.enablement.ch/
- Source: `enablement-ch/enablement-site`, Astro, deployed from `main` to Vercel.
- The latest homepage Allbound diagram correction was pushed as commit `35a5a7f` and verified on the live homepage. The production build passed.
- No website change is pending. The next step is the user's deeper homepage review and any requested iteration.

## Positioning and voice

- Lead with **Allbound**: one connected system combining LinkedIn thought leadership, signal-based outbound, and AI revenue operations.
- Address B2B tech companies with proven product-market fit. The promise is to scale an established business, not find its first market.
- Build a **company brand**. Service and FAQ copy should say "the founding team" or "our team" where relevant, without centering either individual by name. The founders section may still show both people during the transition.
- Present the team as building and running the system with the client. Do not make handoff or short engagements the core public pitch. Keep contract length off the public pages.
- Proof must be accurate. Preserve existing customer examples, testimonial videos, and galleries. Do not present a case study as published if it is not live.

## Homepage direction

- Keep the rotating hero promises, video, booking CTA, logo band, and client testimonials. The headline splits white and red text in the same way as the service pages.
- The Allbound engine graphic is a sequence: **Outbound / Content / Ads → Signals and responses → Qualification → Route to sales → Sales conversation → Opportunity and revenue**. AI revenue operations supports the full sequence; CRM outcomes feed back into the motions.
- There are exactly **three** boxes in the first graphic layer. Market signals belong in the following signals layer, not beside the three motions.
- The content box says "Company and team voices" to support the company-brand direction.
- The three service graphics should tell their respective stories in the shared visual language. The thought leadership comparison uses red for the old world and green for the new world.
- Homepage copy and FAQ should describe the holistic system and how the team works together without naming an individual as the delivery owner.

## Pages and design

- Service pages: `/linkedin-thoughtleadership/`, `/signal-based-outbound/`, and `/ai-revenue-operations/` are live and linked from the Services menu.
- Resources: `/resources/ai-sales-coach/` and `/resources/gtm-audit/` established the current page style.
- Customer results and the current example galleries are important proof assets. Keep them when editing related pages.
- Dark mode is the only site theme. Use compact spacing, red eyebrows and accents, rounded red bullets where appropriate, green for positive states, and subtle grids/glows/textures. Menu text and submenu hover states should remain readable.
- Shared website design rules are in `~/enablement-design-system/site-plan.md`; use that file for reusable design decisions. This file records project and conversation state.

## Working files and verification

- Homepage: `src/pages/index.astro`
- Allbound diagram: `src/components/visuals/AllboundFlow.astro`
- Rotating hero: `src/components/Hero.astro`
- Founders section: `src/components/FoundersBlock.astro`
- Before publishing: run `npm run build` and `git diff --check`. A push to `main` triggers production deployment; verify the changed copy on the live URL.
