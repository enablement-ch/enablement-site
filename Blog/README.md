# Enablement blog: editorial and site framework

Framework and implementation record, 2026-11-01. The Astro blog index, article template, content collection, and first article are implemented in this repository. The two supplied competitor articles were examples of page and content building blocks; their citation counts and rankings were supplied by the user and were not independently verified here.

## Recommendation

Build a native `/blog` index and `/blog/[slug]` article template in the existing Astro site. Store articles as Markdown content entries with validated frontmatter. Use one article production skill to research and draft an evidence-backed entry, and one publishing skill to validate and integrate an approved entry into the site. Keep editorial approval before publication. Start with a small set of strong articles tied to Enablement's three services and real customer evidence, then use the agency dashboard and Search Console to choose and revise topics.

The design should borrow navigational and comparison patterns from Frontal and Understory, while using Enablement's dark palette, typography, frame, and proof rules in the shared `enablement-brain/Design/site-plan.md`. The blog should look like part of the current site, with an especially comfortable long-form reading surface.

## What the reference blogs show

| Building block | Understory | Frontal | Enablement decision |
|---|---|---|---|
| Index | Search and categories; article cards with summary | Search and topic filters; cards with author, date, summary | Index with featured article, topic filters, search only when article volume warrants it, and simple cards |
| Opening | Clear answer and named audience before detail | Quick comparison and strong framing before detail | Answer the searcher's actual question in the first screen or first paragraphs |
| Navigation | Table of contents with anchored sections | Left-side "On this page" rail | Sticky desktop contents rail; compact disclosure or horizontal jump list on mobile |
| Comparison | At-a-glance matrix, stated selection criteria, consistent profiles | Quick-compare cards, ranking criteria, fit and limitations | Comparison block only for comparison intent; show criteria, best fit, limitations, and sources |
| Trust | Named author, date, case links, related reading, source list | Named author, updated date, proof links, detailed evaluations | Real byline and reviewer if applicable, dated sources, scoped proof, visible updates |
| Conversion | Side booking prompt and end CTA | Side booking prompt and contextual in-article CTA | One restrained contextual CTA after useful content and a final CTA; link to a relevant tool or service when that is a better next step |

The [Understory article](https://www.understoryagency.com/blog/best-executive-thought-leadership-agencies-b2b-saas) states its audience and research date, discloses that Understory wrote and appears in the ranking, shows a comparison table, then repeats the same evaluation dimensions across entries. The [Frontal article](https://frontal.so/blog/best-gtm-agencies) offers an early quick comparison, explicit ranking standards, a contents rail, proof examples, FAQ, and several booking prompts. Their [index pages](https://www.understoryagency.com/blog) and [Frontal index](https://frontal.so/blog) show how categories and cards support browsing.

**What to avoid:** a universal article template that forces comparison tables or FAQ onto every topic; repeated booking panels that interrupt reading; self-ranking presented as independent research; unsupported superlatives; a date changed without substantive review; and copied competitor wording or design. The supplied pages demonstrate useful UX patterns, not proof that those elements caused their visibility.

## Proposed article layout

```text
Site navigation
Breadcrumb: Blog / Topic / Article
Article header: topic label, H1, short answer/deck, author, dates, reading time
Optional hero visual with meaningful caption

Desktop: contents rail | readable article column | optional single contextual CTA
Mobile: compact contents control, then full-width article

Article body: intent-specific modules, evidence, examples, internal links
Contextual CTA after a relevant section
Sources and methodology, where research or comparisons require them
Author/reviewer note and related articles
Final next step and site footer
```

**Shared components:** `BlogCard`, `ArticleHeader`, `TableOfContents`, `ArticleBody`, `Callout`, `ComparisonTable`, `EvidenceBlock`, `ArticleCTA`, `AuthorBlock`, `Sources`, and `RelatedArticles`. They are a component library, not required sections. Use the existing `BaseLayout`, `Nav`, `Footer`, color tokens, Sofia Sans, JetBrains Mono, and booking pattern. Keep the main article column around 65-75 characters per line and use clear focus states, heading anchors, keyboard-operable controls, accessible tables, and responsive media.

**Index:** `/blog` should have a concise proposition, featured article, topic filters based on the service taxonomy, then reverse-chronological cards. Do not add empty categories. Search can wait until there are enough articles to justify it. Link the index from site navigation only when it has published content.

**Article modules by intent:**

| Search intent | Useful module sequence |
|---|---|
| How-to or playbook | Direct answer, prerequisites, steps with real examples, common failure points, measurement, next action |
| Comparison or shortlist | Who the guide is for, quick answer, criteria and research date, comparison, balanced profiles, fit guide, limitations, sources |
| Definition or framework | Plain definition, why it matters, operational model, example, decision guide, related tools |
| Original analysis | Question, method and dataset, findings, caveats, implications, source material |

Write headings that describe the actual answer beneath them. A table of contents helps navigation but is not a search ranking device by itself. FAQ should answer genuine remaining buyer questions. Avoid a fixed word count or keyword density. Cite externally sourced claims close to the claim, link primary sources where possible, and distinguish Enablement experience from outside evidence. Where an article compares vendors, record inclusion criteria, research date, any commercial relationship, and each company's limitations.

## Technical contract for the Astro build

The current site already has a Markdown content collection for case studies, `BaseLayout` canonical metadata, shared JSON-LD for pages and breadcrumbs, an Astro sitemap, `robots.txt`, and `npm run audit:seo`. Extend those patterns instead of introducing a CMS or second site.

1. Add a `blog` content collection in `src/content.config.ts` using `glob` and a Zod schema. Store entries at `src/content/blog/<slug>.md`. Use a draft flag that excludes drafts from route generation, the index, related content, and sitemap.
2. Add `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro` (or the Astro equivalent supported by the installed version). Generate static pages from the collection. Article body and important links must appear in rendered HTML, including without client-side JavaScript.
3. Proposed frontmatter: `title`, `description`, `summary`, `publishedAt`, optional `updatedAt`, `author`, optional `reviewer`, `category`, `tags`, `heroImage`, `heroAlt`, `draft`, optional `featured`, and an optional `cta` key that maps to approved site actions. Derive the URL from the filename. Keep evidence notes and source URLs in the body or a companion editorial brief, not in opaque metadata fields.
4. Extend the layout metadata for article-specific Open Graph image and `article` type. Add `BlogPosting` JSON-LD with accurate headline, canonical URL, author, publisher, publication and modification dates, and image only when present. Preserve the existing Organization, WebSite, WebPage, and BreadcrumbList graph. Add Blog as the middle breadcrumb for article routes.
5. Keep absolute `https://www.enablement.ch/blog/...` canonicals and no trailing slash. Include only public indexable articles in the sitemap. Make the blog reachable from navigation and link articles to relevant services, tools, customer results, and other articles. Use descriptive link text.
6. Use images only when they clarify a point. Store optimized local images, set dimensions, meaningful alt text, and a useful social crop. Give comparison tables a mobile presentation that retains all values and headers.
7. Add blog-specific checks to `npm run audit:seo`: required metadata, one H1, unique canonicals, draft exclusion, sitemap entries, valid structured data, intact internal links and anchors, and existing image checks. Run `npm run build` and `npm run audit:seo` before an article is considered publishable.

Google's [helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) prioritizes original, reliable work and clear authorship. Its [generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasizes normal SEO foundations, crawlable pages, useful structure, and distinctive expertise. [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) helps describe a page but does not guarantee a rich result or citation. A sitemap is a discovery hint, not an indexing guarantee ([Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)). No page format can guarantee AI mentions.

## Assessment of `agentic-aeo-skills`

The [repository](https://github.com/Spirizeon/agentic-aeo-skills) is MIT licensed. It contains an audit skill, benchmark, AI traffic detector, `llms.txt` checker, token counter, and Python scripts. It targets documentation and AI coding agents more than B2B article production. It contains no usable article-writing workflow, topic research workflow, Astro content model, or publishing integration. Its README says six sub-skills while the checked tree and master skill list five supporting skills. Treat it as an idea library, not a complete copy.

| Element | Decision | Reason |
|---|---|---|
| Semantic HTML, clear headings, descriptive image alt text, crawl and robots checks | Adapt | Directly useful for accessible, discoverable articles |
| Repeatable audit checklist | Adapt | Integrate with the existing site SEO audit and actual published routes |
| Log-based AI crawler monitoring | Optional later | Requires server or edge logs and does not prove citation or answer inclusion |
| `llms.txt` requirement and scoring | Skip for launch | Google says it does not use `llms.txt` for Search or its generative features; no demonstrated blog outcome here |
| Public `AGENTS.md` or `SKILL.md` as search signals | Skip | These are agent-workflow files, not requirements for indexing articles |
| Fixed token ceilings for pages | Skip | The repository's limits are for agent context efficiency, not reader value or Search requirements |
| Benchmark score and scripts as an SEO success metric | Skip | Its scoring rewards files like `llms.txt` and `AGENTS.md`; its Markdown check can count any HTTP 200 as available, and its robots heuristic only searches for terms in text |
| `Sitemap: .../llms.txt` in its checklist | Reject | A `Sitemap` directive should point to an actual sitemap, as the current site already does |

If code is reused later, retain the MIT license notice and review the script behavior against the current site. No repository code is needed for this planning phase.

## Two proposed skills

The operational skills belong in the shared skills repository under unique Enablement names, with this document as the planning reference. They were drafted before the site schema and article template were implemented. The publishing skill must establish that shared foundation on its first page-creation task, and both skills should be checked against the finished schema before the first live article.

### 1. `enablement-blog-article-writer`

**Input:** topic or query cluster, intended buyer and search intent, relevant Enablement offer, agency-dashboard evidence if available, source links, proprietary evidence, author/reviewer, and desired next step.

**Workflow:** assess query intent and existing site coverage; build an outline; collect and verify primary sources and Enablement proof; draft the direct answer and intent-specific modules; write metadata and Markdown frontmatter; check originality, attribution, balance, internal links, claim scope, and CTA relevance. Produce a draft plus a compact claim/source log and unresolved questions. Never invent customer figures, quotes, vendor prices, rankings, or credentials. Ask for the missing evidence that materially affects a claim.

**Output:** reviewable Markdown article under the blog content collection with `draft: true`, plus its editorial brief. It does not publish.

### 2. `enablement-blog-page-publisher`

**Input:** approved article file and image assets.

**Workflow:** validate schema, slug, links, images, metadata, source dates, disclosure, and render; preview desktop and mobile; run build and SEO audit; show the rendered article and any issues; then switch the draft to public only after editorial approval. A deployment to the live site is a separate final approval step unless previously authorized.

**Output:** a ready-to-review page and a short verification report, followed by a publishable commit when approved. The skill should use the site's shared components rather than generating bespoke Astro markup for each post.

## Sequence and acceptance criteria

1. **Approve the framework.** Settle the page layout, content fields, authorship model, and the first CTA destinations. Use the user-provided competitor dashboard during the following topic phase, not as a substitute for reader fit.
2. **Build the site foundation.** Ship the collection, index, article layout, components, schema, navigation, and SEO audit extensions. Use one sample article marked as a draft to test long text, tables, anchors, source links, and mobile layout.
3. **Exercise the two skills.** The skill files are created now. Check them against the implemented schema and verification commands. Test the writer with one evidence-rich topic and the publisher with the approved sample.
4. **Prioritize and write topics.** Combine dashboard opportunities with ICP fit, service relevance, original proof available, existing coverage, and buyer intent. Avoid near-duplicate query variants. Publish a small coherent first batch, then inspect Search Console and conversion data to revise.

The foundation is ready when an approved Markdown entry renders consistently on desktop and mobile, has accurate byline and dates, passes the build and SEO audit, appears in the index and sitemap only when public, has valid links and structured data, and offers a relevant path to an Enablement service or tool. Rankings, citations, and conversion rates are measured after publication; they are not launch guarantees.
