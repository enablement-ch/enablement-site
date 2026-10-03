# Competitor content reports

The public LinkedIn Analysis form sends all visible form fields and
attribution to the dedicated Clay webhook via the server endpoint, with
`requestType: linkedin_analysis` and `analysisType: competitor_content_pull`.
Review requests there, run the
`content-lead-magnet-competitor-analysis` workflow, and publish each reviewed
result as a hosted page. The source skill is an analyst workflow, so the site
does not claim to generate a report instantly.

Every new request includes a `reportSlug` and `statusUrl` in Clay. The visitor
is redirected to that status URL. Copy `reportSlug` into the JSON before
publishing so the status page can find the finished report. For a report
requested in outreach without a website form, omit `reportSlug` and the script
will generate a new unlisted slug.

Create a JSON file using this shape, then run
`npm run publish:competitor-report -- /path/to/report.json`. The script checks
required fields, adds an unguessable URL slug, and writes a JSON file here.
Review the new page locally, commit, and deploy. Send its URL in the existing
LinkedIn conversation where possible; use the submitted work email otherwise.

```json
{
  "companyName": "Example Company",
  "companyDomain": "example.com",
  "reportSlug": "example-com-copy-this-from-clay-if-present",
  "category": "B2B software",
  "window": "Last 90 days, ending 3 October 2026",
  "screenedCompanies": 6,
  "mode": "active",
  "headline": "Your buyers are hearing one story from this category.",
  "summary": "We reviewed six relevant companies and three individual voices. Their strongest content repeats the same argument, leaving a buyer problem Example Company could own.",
  "consequence": "If your team publishes the same advice, buyers have little reason to remember you when a project starts.",
  "voices": [
    {
      "name": "Jane Example",
      "title": "CEO",
      "company": "Peer Company",
      "linkedinUrl": "https://www.linkedin.com/in/jane-example/",
      "posts": 12,
      "followers": 4200,
      "medianEngagement": 34,
      "representativePost": "A short, verified excerpt from a public post.",
      "representativePostUrl": "https://www.linkedin.com/posts/example"
    }
  ],
  "themes": [
    {
      "title": "The established topic",
      "explanation": "What the posts actually argue and why buyers respond.",
      "owner": "Peer Company",
      "exampleUrl": "https://www.linkedin.com/posts/example"
    }
  ],
  "openings": [
    {
      "title": "A buyer problem Example Company can explain",
      "buyerProblem": "What the buyer struggles to understand or decide.",
      "whyItFits": "Evidence from Example Company's own positioning or work.",
      "firstMove": "A specific post or story to publish first."
    },
    {
      "title": "A second defensible opening",
      "buyerProblem": "Another buyer problem.",
      "whyItFits": "Evidence the company can substantiate.",
      "firstMove": "A specific first post."
    }
  ],
  "handoff": "A topic only matters if the right accounts see it and your team can act when they engage."
}
```

Use individual profile metrics to compare individuals. Do not compare a
person's followers to a company page. Never claim impressions or reach from
public LinkedIn data. Keep the prospect's report factual and specific, with
links to public posts where available. The report page is unlisted and marked
`noindex`, but anyone with its URL can open it. Do not publish private data.
