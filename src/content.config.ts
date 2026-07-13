import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    company: z.string(),
    /** The result suffix. Card title becomes: How [Company] got [result] */
    result: z.string(),
    /** One-line outcome summary, used in card body and detail hero lead */
    outcome: z.string(),
    /** Optional full case-study page title. Falls back to "How [Company] got [result]". */
    headline: z.string().optional(),
    /** Method or system name used in the proof-led page title. */
    method: z.string().optional(),
    /** Richer hero explanation for the detail page. Falls back to outcome. */
    subhead: z.string().optional(),
    metrics: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        context: z.string().optional(),
      }),
    ),
    /** Person attribution — buyer/champion of the engagement */
    person: z
      .object({
        name: z.string(),
        title: z.string(),
        photo: z.string().optional(), // path in public/team/
      })
      .optional(),
    /** Pull quote for the case study */
    quote: z.string().optional(),
    featuredQuote: z
      .object({
        text: z.string(),
        attribution: z.string(),
        detail: z.string().optional(),
      })
      .optional(),
    challenge: z
      .object({
        title: z.string().optional(),
        intro: z.string(),
        paragraphs: z.array(z.string()).optional(),
        bullets: z.array(z.string()).optional(),
        keyLine: z.string().optional(),
        quote: z
          .object({
            text: z.string(),
            attribution: z.string().optional(),
            detail: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    solution: z
      .object({
        title: z.string(),
        paragraphs: z.array(z.string()),
      })
      .optional(),
    solutionSteps: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .optional(),
    results: z
      .object({
        title: z.string().optional(),
        intro: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        bullets: z.array(z.string()).optional(),
        narrative: z.string().optional(),
      })
      .optional(),
    outcomeSection: z
      .object({
        title: z.string(),
        paragraphs: z.array(z.string()),
      })
      .optional(),
    summaryMetrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    finalLesson: z.string().optional(),
    cta: z
      .object({
        label: z.string(),
        href: z.string(),
      })
      .optional(),
    /** Video testimonial — URL or filename in public/testimonials/ */
    videoTestimonial: z.string().optional(),
    /** Company logo path in public/logos/ */
    logo: z.string().optional(),
    industry: z.string().optional(),
    teamSize: z.coerce.string().optional(),
    geography: z.string().optional(),
    engagementLength: z.string().optional(),
    services: z.array(z.string()).optional(),
    /** Public case-study route gate. Legacy drafts stay unlisted and unbuilt by default. */
    live: z.boolean().default(false),
    /** Hidden legacy route gate for the pre-relaunch case-study archive. */
    legacy: z.boolean().default(false),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { caseStudies };
