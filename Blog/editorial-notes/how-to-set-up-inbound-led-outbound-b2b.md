# Editorial note: How to set up inbound-led outbound in B2B

Drafted and approved for publication 2026-11-02. Public article: `src/content/blog/how-to-set-up-inbound-led-outbound-b2b.md`. It is marked `draft: false`.

## Angle and editorial choices

- The user's [HeyReach reference](https://www.heyreach.io/blog/inbound-led-outbound) describes inbound-led outbound as outreach triggered and prioritized by inbound behavior, with capture, enrichment, execution, reply handling, and CRM feedback. Its implementation section is centered on HeyReach. This draft uses the general operating problem and writes an Enablement-specific setup guide instead of adapting its wording or vendor sequence.
- The [Oppora reference](https://oppora.ai/blog/inbound-led-outbound/) lists possible source signals and tactics. This draft avoids treating every page view, email open, or return visit as buying intent. It groups actions by what can actually be known and which response they warrant.
- This article is deliberately narrower than Enablement's published signal-based outbound definition. It focuses on first-party engagement with the company and the system needed to act on it. The existing article covers first-, second-, and third-party signal types.
- The step sequence reflects Enablement's current service pages: content or campaigns create engagement; the system captures, enriches, qualifies, routes, follows up, and reports to the CRM.
- The VP of Sales example is illustrative, not a customer story. No conversion rate, response-time benchmark, or customer outcome was invented.

## Supporting research, checked 2026-11-02

- [Google Analytics events](https://developers.google.com/analytics/devguides/collection/ga4/events) describe tracking website interactions. Analytics events do not by themselves identify every visitor.
- [LinkedIn profile visibility settings](https://www.linkedin.com/help/linkedin/answer/a565205) show that some profile visitors are private or partly private.
- [Clay's inbound qualification guide](https://www.clay.com/guides/how-to-automate-inbound-lead-qualification) and [Clay's form enrichment workflow](https://university.clay.com/claybooks/enrich-and-score-inbound-leads-from-your-website-instantly) support the capture, enrichment, scoring, and CRM update concepts. Product-specific setup details were left out of the article.
- [HubSpot workflow triggers](https://knowledge.hubspot.com/workflows/set-filter-enrollment-triggers) and [suppression settings](https://knowledge.hubspot.com/workflows/contact-company-deal-ticket-or-quote-not-enrolled-in-workflow) show that exact workflow capabilities depend on account configuration and subscription. The draft makes no claim that every HubSpot account includes every trigger.
- [Enablement's signal-based outbound service](https://www.enablement.ch/signal-based-outbound), [LinkedIn service](https://www.enablement.ch/linkedin-thoughtleadership), and the two current blog articles provide the internal links and positioning.

## Questions for Gilbert's review

1. Which one real inbound signal-to-meeting example can we show, including the source, fit check, follow-up, and outcome? That would make the guide more distinctive.
2. Does the current system classify and route replies exactly as described, or should the handoff section name a narrower process?
3. Is Gilbert the right byline for this article?
