// Create (or update) cron-job.org jobs that POST the CRM check-in (08:51)
// and check-out (18:00) every Monday–Friday (Asia/Ho_Chi_Minh).
//
// Usage: node --env-file=.env create-job.mjs

const API = "https://api.cron-job.org";
const KEY = process.env.CRONJOB_KEY;

if (!KEY) {
  console.error("Missing CRONJOB_KEY in .env");
  process.exit(1);
}

const makeJob = (title, url, hour, minute) => ({
  title,
  url,
  enabled: true,
  saveResponses: true,
  requestMethod: 1, // 0 = GET, 1 = POST
  // Email the cron-job.org account owner:
  notification: {
    onFailure: true, // when a run fails
    onSuccess: true, // when a run succeeds again after a failure
    onDisable: true, // when the job gets auto-disabled after repeated failures
  },
  schedule: {
    timezone: "Asia/Ho_Chi_Minh",
    expiresAt: 0,
    hours: [hour],
    minutes: [minute],
    mdays: [-1], // every day of month
    months: [-1], // every month
    wdays: [1, 2, 3, 4, 5], // Mon–Fri (0 = Sunday)
  },
});

const JOBS = [
  makeJob(
    "CRM check-in 08:51 (Mon-Fri)",
    "https://api-services.hostless.app/crm/checkin?device=Desktop",
    8,
    51,
  ),
  makeJob(
    "CRM check-out 18:00 (Mon-Fri)",
    "https://api-services.hostless.app/crm/checkout?device=Desktop",
    18,
    0,
  ),
];

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

for (const job of JOBS) {
  const existing = jobs.find((j) => j.title === job.title);
  if (existing) {
    await api("PATCH", `/jobs/${existing.jobId}`, { job });
    console.log(`Updated job #${existing.jobId}  ${job.title}`);
  } else {
    const { jobId } = await api("PUT", "/jobs", { job });
    console.log(`Created job #${jobId}  ${job.title}`);
  }
}
