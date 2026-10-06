# Competitor content reports

## Live on-page analysis flow

The form at `/resources/linkedin-analysis` asks for a LinkedIn profile URL
and company domain. It still posts to the same
dedicated Clay webhook. Each payload contains `jobId` and a complete
`callbackUrl`. Clay should enrich the row, then POST its JSON object to that
exact `callbackUrl` with `Content-Type: application/json`. The callback URL is
unique to that request and includes a secret token, so do not expose it in
public logs or a browser. The callback returns HTTP 202 when research starts.

Example callback body (additional Clay fields are accepted):

```json
{
  "contact_first_name": "Jane",
  "contact_last_name": "Example",
  "contact_job_title": "CEO",
  "contact_linkedin_url": "https://www.linkedin.com/in/example/",
  "company_name": "Example Company",
  "company_domain": "example.com",
  "company_linkedin_url": "https://www.linkedin.com/company/example/"
}
```

The page polls `/api/linkedin-analysis-status?jobId=...` and shows Clay intake,
competitor discovery, founder-post analysis, and finished findings on the same page. The job ID stays in the
visitor's browser storage so a refresh resumes the page. The job and report
expire after 24 hours. No static result page is created for this flow.

Production needs `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `OPENAI_API_KEY`, and `RAPIDAPI_KEY`
on the Vercel project. The Redis store holds transient jobs;
the OpenAI Responses web search researches public sources after Clay calls
back. Discovery reads the homepage, linked service pages, and the submitted
person's recent public posts. It derives specialist search phrases, reads
published agency roundups, and also searches for founders with a similar offer.
Competitor homepages are screened for the same delivery model and buyer;
software vendors are excluded from a services-company comparison. Up to eight
companies proceed to founder verification. Personal profile URLs must come
from published search sources or company website links, rather than guessed slugs.

The collector follows post continuation tokens through the 90-day window and
retries temporary fetch failures. It counts original posts and all reactions,
comments and reposts. Topic counts, averages and medians are calculated from
classified posts. Profiles that could not be read are never counted as inactive.
Missing profiles prevent a confident quiet-category claim. The closing audit
invitation frames the results as a quick automated scan.

`OPENAI_RESEARCH_MODEL` is optional and defaults to `gpt-4.1`;
`OPENAI_ANALYSIS_MODEL` defaults to `gpt-5`. The Clay callback allows up to
800 seconds for research on the existing Vercel Pro project. The tool is linked
from the Tools menu. Progress and generated report cards use the site's styles
on desktop and mobile.

## Legacy reviewed reports

The earlier manual publishing path is retained for reviewed reports outside
the live form flow. Run the `content-lead-magnet-competitor-analysis` workflow
and publish each reviewed result as a hosted page.

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
