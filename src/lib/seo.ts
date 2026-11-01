const site = "https://www.enablement.ch";
const organizationId = `${site}/#organization`;

const serviceNames: Record<string, string> = {
  "/linkedin-thoughtleadership": "LinkedIn Thought Leadership",
  "/signal-based-outbound": "Signal-Based Outbound",
  "/ai-revenue-operations": "AI Revenue Operations",
};

export interface BlogArticleSeo {
  headline: string;
  author: string;
  publishedAt: Date;
  updatedAt?: Date;
  image?: string;
}

export function pageSchema(path: string, title: string, description: string, article?: BlogArticleSeo) {
  const url = `${site}${path}`;
  const name = title.replace(/\s+[|\-]\s+Enablement\.ch$/, "");
  const nodes: Record<string, unknown>[] = [
    {
      "@type": "Organization", "@id": organizationId, name: "Enablement.ch",
      url: `${site}/`, logo: `${site}/icon.png`,
      description: "GTM engineering for B2B teams: LinkedIn thought leadership, signal-based outbound, and AI Revenue Operations.",
    },
    {
      "@type": "WebSite", "@id": `${site}/#website`, name: "Enablement.ch",
      url: `${site}/`, inLanguage: "en", publisher: { "@id": organizationId },
    },
    {
      "@type": ["/customer-results", "/blog"].includes(path) ? "CollectionPage" : "WebPage",
      "@id": `${url}#webpage`, url, name, description, inLanguage: "en",
      isPartOf: { "@id": `${site}/#website` }, about: { "@id": organizationId },
      ...(serviceNames[path] ? { mainEntity: { "@id": `${url}#service` } } : {}),
    },
  ];
  if (path !== "/") {
    const ancestors = [{ name: "Home", item: `${site}/` }];
    if (path.startsWith("/customer-results/") || path.startsWith("/legacy-case-studies/")) {
      ancestors.push({ name: "Customer Results", item: `${site}/customer-results` });
    }
    if (path.startsWith("/blog/")) {
      ancestors.push({ name: "Blog", item: `${site}/blog` });
    }
    ancestors.push({ name, item: url });
    nodes.push({ "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: ancestors.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) });
  }
  if (serviceNames[path]) {
    nodes.push({ "@type": "Service", "@id": `${url}#service`, name: serviceNames[path], serviceType: serviceNames[path], description, url, provider: { "@id": organizationId } });
  }
  if (article) {
    nodes.push({
      "@type": "BlogPosting", "@id": `${url}#article`, mainEntityOfPage: { "@id": `${url}#webpage` },
      headline: article.headline, description, url, inLanguage: "en",
      datePublished: article.publishedAt.toISOString(),
      dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
      author: { "@type": "Person", name: article.author },
      publisher: { "@id": organizationId },
      ...(article.image ? { image: new URL(article.image, site).href } : {}),
    });
  }
  return { "@context": "https://schema.org", "@graph": nodes };
}
