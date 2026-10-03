# Website conversation state

Last updated: 2026-10-03

## Current status

- Production site: https://www.enablement.ch/
- Source: `enablement-ch/enablement-site`, Astro, deployed from `main` to Vercel.
- The homepage Allbound diagram includes Capture and Qualify as a narrowing funnel, followed by Route, Engage, Close, and Learn.
- The homepage booking actions now use direct calendar buttons below the hero video, Allbound diagram, founder involvement card, and in the final CTA. The navigation button reads "Book a GTM session" site-wide.
- The homepage How we work booking button is centered below the founder card; the Allbound Audit text link in that section was removed.
- The LinkedIn thought leadership page uses "I want to fix my LinkedIn system" in the hero, both gallery text blocks, customer proof, engagement, and final CTA. On desktop, each gallery button stays with the sticky text beside the scrolling images; on mobile it sits below that text.
- The signal-based outbound page uses "I want to fix my outbound system" in its hero, below the three campaign plays, in engagement, and in the final CTA. The customer results section has no booking button.
- The AI Revenue Operations page uses "I want to fix my revenue system" for its page-specific booking buttons, including below the connected system and within the "What changes in practice" text block.

## Positioning and voice

- Lead with **Allbound**: one connected system combining LinkedIn thought leadership, signal-based outbound, and AI revenue operations.
- Address B2B tech companies with proven product-market fit. The promise is to scale an established business, not find its first market.
- Build a **company brand**. Service and FAQ copy should say "the founding team" or "our team" where relevant, without centering either individual by name. The founders section may still show both people during the transition.
- Present the team as building and running the system with the client. Do not make handoff or short engagements the core public pitch. Keep contract length off the public pages.
- Proof must be accurate. Preserve existing customer examples, testimonial videos, and galleries. Do not present a case study as published if it is not live.

## Homepage direction

- Keep the rotating hero promises, video, booking CTA, logo band, and client testimonials. The headline splits white and red text in the same way as the service pages.
- The Allbound engine graphic is a sequence: **Outbound / Content / Ads → Capture → Qualify → Route → Engage → Close → Learn**. AI revenue operations supports the full sequence; signals, conversations, and deals feed back into the motions.
- There are exactly **three** boxes in the first graphic layer. Market signals belong in the following signals layer, not beside the three motions.
- The content box says "Company and team voices" to support the company-brand direction.
- The three service graphics should tell their respective stories in the shared visual language. The thought leadership comparison uses red for the old world and green for the new world.
- Homepage copy and FAQ should describe the holistic system and how the team works together without naming an individual as the delivery owner.

## Pages and design

- Service pages: `/linkedin-thoughtleadership/`, `/signal-based-outbound/`, and `/ai-revenue-operations/` are live and linked from the Services menu.
- The navigation dropdown is called Tools. It links to `/resources/gtm-self-audit` and `/resources/ai-sales-coach`.
- `/resources/gtm-self-audit` is the public eight-question interactive GTM Self Audit. It shows an immediate weighted score and two gap cards, each with a challenging question, the commercial consequence, and a first action. The direct booking action follows the gaps; customer proof stays in the section below the audit explanation. The former `/resources/gtm-audit` route redirects here.
- Customer results and the current example galleries are important proof assets. Keep them when editing related pages.
- Dark mode is the only site theme. Use compact spacing, red eyebrows and accents, rounded red bullets where appropriate, green for positive states, and subtle grids/glows/textures. Menu text and submenu hover states should remain readable.
- Shared website design rules are in `~/Claude Code/enablement-brain/Design/site-plan.md`; use that file for reusable design decisions. This file records project and conversation state.

## Working files and verification

- Homepage: `src/pages/index.astro`
- Allbound diagram: `src/components/visuals/AllboundFlow.astro`
- Rotating hero: `src/components/Hero.astro`
- Founders section: `src/components/FoundersBlock.astro`
- Before publishing: run `npm run build` and `git diff --check`. A push to `main` triggers production deployment; verify the changed copy on the live URL.
