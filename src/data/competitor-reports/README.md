# Competitor content reports

## Live on-page analysis flow

The form at `/resources/linkedin-analysis` asks for a LinkedIn profile URL,
company domain, and optional known competitors. It still posts to the same
dedicated Clay webhook. Each payload contains `jobId` and a complete
`callbackUrl`. Clay should enrich the row, then POST its JSON object to that
exact `callbackUrl` with `Content-Type: application/json`. The callback URL is
unique to that request and includes a secret token, so do not expose it in
public logs or a browser. The callback returns HTTP 202 when research starts.

Example callback body (additional Clay fields are accepted):

```json
{
  "companyName": "Example Company",
  "companyDescription": "B2B software for industrial teams",
  "linkedinProfile": "https://www.linkedin.com/in/example/",
  "competitors": [
    { "name": "Peer Company", "domain": "peer.example", "reason": "Same buyer and use case" }
  ]
}
```

The page polls `/api/linkedin-analysis-status?jobId=...` and shows Clay intake,
research, and finished findings in the same page. The job ID stays in the
visitor's browser storage so a refresh resumes the page. The job and report
expire after 24 hours. No static result page is created for this flow.

Production needs `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and
`OPENAI_API_KEY` on the Vercel project. The Redis store holds transient jobs;
the OpenAI Responses web search researches public sources after Clay calls
back. `OPENAI_RESEARCH_MODEL` is optional and defaults to `gpt-5`. Keep the
Tools menu link paused until the complete Clay callback flow is tested live.

## Legacy reviewed reports

The public LinkedIn Analysis form sends all visible form fields and
attribution to the dedicated Clay webhook via the server endpoint, with
`requestType: linkedin_analysis` and `analysisType: competitor_content_pull`.
Review requests there, run the
`content-lead-magnet-competitor-analysis` workflow, and publish each reviewed
result as a hosted page. The source skill is an analyst workflow, so the site
does not claim to generate a report instantly.

Create a JSON file using this shape, then run
`npm run publish:competitor-report -- /path/to/report.json`. The script checks
required fields, adds an unguessable URL slug, and writes a JSON file here.
Review the new page locally, commit, and deploy. Send its URL in the existing
LinkedIn conversation where possible; use the submitted work email otherwise.

```json
{
  "companyName": "Example Company",
  "companyDomain": "example.com",
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
