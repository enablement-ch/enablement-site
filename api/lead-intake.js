const MEETING_URL = "https://revenue.enablement.ch/meetings/l-heiz/first-meeting";

function json(status, body) {
  return { status, body };
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildMeetingUrl(email) {
  const url = new URL(MEETING_URL);
  url.searchParams.set("email", email);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", "lead_intake");
  url.searchParams.set("utm_campaign", "homepage_booking_flow");
  return url.toString();
}

function applyOptionalProperty(properties, envName, value) {
  const propertyName = process.env[envName];
  if (propertyName && value) {
    properties[propertyName] = String(value);
  }
}

async function upsertHubSpotContact({ email, companyPage, attribution }) {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return { skipped: true, reason: "HUBSPOT_PRIVATE_APP_TOKEN is not set" };
  }

  const properties = { email };
  const companyPageProperty = process.env.HUBSPOT_COMPANY_PAGE_PROPERTY;

  if (companyPage && companyPageProperty) {
    properties[companyPageProperty] = companyPage;
  }

  applyOptionalProperty(properties, "HUBSPOT_LEAD_SOURCE_PROPERTY", "website_booking_flow");
  applyOptionalProperty(properties, "HUBSPOT_UTM_SOURCE_PROPERTY", attribution?.utm_source);
  applyOptionalProperty(properties, "HUBSPOT_UTM_MEDIUM_PROPERTY", attribution?.utm_medium);
  applyOptionalProperty(properties, "HUBSPOT_UTM_CAMPAIGN_PROPERTY", attribution?.utm_campaign);
  applyOptionalProperty(properties, "HUBSPOT_LANDING_PAGE_PROPERTY", attribution?.landingPage);
  applyOptionalProperty(properties, "HUBSPOT_REFERRER_PROPERTY", attribution?.referrer);

  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            idProperty: "email",
            id: email,
            properties,
          },
        ],
      }),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `HubSpot contact upsert failed: ${response.status} ${JSON.stringify(body)}`,
    );
  }

  return { skipped: false, body };
}

async function sendToClay(payload) {
  const webhookUrl = process.env.CLAY_INTAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return { skipped: true, reason: "CLAY_INTAKE_WEBHOOK_URL is not set" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Clay intake failed: ${response.status} ${body}`);
  }

  return { skipped: false, body };
}

function send(response, result) {
  response.status(result.status).json(result.body);
}

function parseBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return send(response, json(405, { error: "Method not allowed" }));
  }

  let body;
  try {
    body = parseBody(request);
  } catch {
    return send(response, json(400, { error: "Invalid JSON body" }));
  }

  const email = String(body.email || "").trim().toLowerCase();
  const companyPage = String(body.companyPage || "").trim();
  const attribution = {
    utm_source: body.utm_source || "",
    utm_medium: body.utm_medium || "",
    utm_campaign: body.utm_campaign || "",
    utm_term: body.utm_term || "",
    utm_content: body.utm_content || "",
    referrer: body.referrer || "",
    landingPage: body.landingPage || body.pageUrl || "",
    formPage: body.pageUrl || "",
  };

  if (!isEmail(email)) {
    return send(response, json(400, { error: "Valid email is required" }));
  }

  const payload = {
    email,
    companyPage,
    source: "website_lead_intake",
    attribution,
    pageUrl: body.pageUrl || "",
    submittedAt: new Date().toISOString(),
  };

  try {
    const hubspot = await upsertHubSpotContact({ email, companyPage, attribution });
    const clay = await sendToClay(payload);
    const hubspotResult = hubspot.skipped
      ? "skipped"
      : hubspot.body?.results?.[0]?.new
        ? "created"
        : "updated";

    console.log("lead-intake complete", {
      hubspot: hubspotResult,
      clay: clay.skipped ? "skipped" : "sent",
    });

    return send(response, json(200, {
      ok: true,
      redirectUrl: buildMeetingUrl(email),
      hubspot,
      clay,
    }));
  } catch (error) {
    return send(response, json(502, {
      ok: false,
      error: error instanceof Error ? error.message : "Lead intake failed",
    }));
  }
}
