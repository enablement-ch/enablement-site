function domain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  try { return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, ""); }
  catch { return null; }
}

function profilePath(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!/^(www\.)?linkedin\.com$/i.test(url.hostname)) return null;
    return url.pathname.replace(/\/$/, "").toLowerCase();
  } catch { return null; }
}

const text = (value, limit = 300) => String(value || "").trim().slice(0, limit);

function competitors(value) {
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => {
    if (typeof item === "string") return text(item, 160);
    if (item && typeof item === "object") return [text(item.name, 120), text(item.domain, 160)].filter(Boolean).join(" - ");
    return "";
  }).filter(Boolean);
  return typeof value === "string" ? value.split(/[,\n;]/).map((item) => text(item, 160)).filter(Boolean).slice(0, 20) : [];
}

export function normalizeClayPayload(payload, requestInput) {
  const clayDomain = domain(payload.company_domain);
  const clayProfile = profilePath(payload.contact_linkedin_url);
  if (!clayDomain || clayDomain !== requestInput.companyDomain) throw new Error("Clay company_domain does not match the request");
  if (!clayProfile || clayProfile !== profilePath(requestInput.linkedinUrl)) throw new Error("Clay contact_linkedin_url does not match the request");
  return {
    contact: {
      firstName: text(payload.contact_first_name, 80),
      lastName: text(payload.contact_last_name, 80),
      jobTitle: text(payload.contact_job_title, 160),
      linkedinUrl: requestInput.linkedinUrl,
    },
    company: {
      name: text(payload.company_name, 160) || requestInput.companyDomain,
      domain: requestInput.companyDomain,
      linkedinUrl: text(payload.company_linkedin_url, 500),
    },
    knownCompetitors: [...new Set([
      ...competitors(requestInput.knownCompetitors),
      ...competitors(payload.competitors),
    ])],
  };
}
