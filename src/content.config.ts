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
    metrics: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
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
    /** Video testimonial — URL or filename in public/testimonials/ */
    videoTestimonial: z.string().optional(),
    /** Company logo path in public/logos/ */
    logo: z.string().optional(),
    industry: z.string().optional(),
    teamSize: z.coerce.string().optional(),
    geography: z.string().optional(),
    engagementLength: z.string().optional(),
    services: z.array(z.string()).optional(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { caseStudies };