// Create (or update) a cron-job.org job that POSTs the CRM check-in
// every Monday–Friday at 08:51 (Asia/Ho_Chi_Minh).
//
// Usage: node --env-file=.env create-job.mjs

const API = "https://api.cron-job.org";
const KEY = process.env.CRONJOB_KEY;

if (!KEY) {
  console.error("Missing CRONJOB_KEY in .env");
  process.exit(1);
}

const TITLE = "CRM check-in 08:51 (Mon-Fri)";

const job = {
  title: TITLE,
  url: "https://api-services.hostless.app/crm/checkin?device=Desktop",
  enabled: true,
  saveResponses: true,
  requestMethod: 1, // 0 = GET, 1 = POST
  schedule: {
    timezone: "Asia/Ho_Chi_Minh",
    expiresAt: 0,
    hours: [8],
    minutes: [51],
    mdays: [-1], // every day of month
    months: [-1], // every month
    wdays: [1, 2, 3, 4, 5], // Mon–Fri (0 = Sunday)
  },
};

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

const { jobs = [] } = await api("GET", "/jobs");
const existing = jobs.find((j) => j.title === TITLE);

if (existing) {
  await api("PATCH", `/jobs/${existing.jobId}`, { job });
  console.log(`Updated job #${existing.jobId}`);
} else {
  const { jobId } = await api("PUT", "/jobs", { job });
  console.log(`Created job #${jobId}`);
}
