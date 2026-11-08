// Show execution history of every job on cron-job.org.
//
// Usage: node --env-file=.env history.mjs   (or double-click history.bat)

const API = "https://api.cron-job.org";
const KEY = process.env.CRONJOB_KEY;

if (!KEY) {
  console.error("Missing CRONJOB_KEY in .env");
  process.exit(1);
}

const STATUS = {
  0: "Unknown",
  1: "OK",
  2: "DNS error",
  3: "Connect failed",
  4: "HTTP error",
  5: "Timeout",
  6: "Too much data",
  7: "Invalid URL",
  8: "Internal error",
  9: "Failed",
};

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

async function api(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

const fmt = (unix, tz) =>
  new Date(unix * 1000).toLocaleString("vi-VN", {
    timeZone: tz || "Asia/Ho_Chi_Minh",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const { jobs = [] } = await api("/jobs");

if (!jobs.length) {
  console.log("Không có cronjob nào.");
  process.exit(0);
}

for (const job of jobs) {
  const tz = job.schedule?.timezone;
  console.log();
  console.log(
    c.bold(`#${job.jobId}  ${job.title || "(no title)"}`) +
      "  " +
      (job.enabled ? c.green("[enabled]") : c.red("[disabled]")),
  );
  console.log(c.dim(`    ${job.url}`));

  let data;
  try {
    data = await api(`/jobs/${job.jobId}/history`);
  } catch (e) {
    console.log(c.red(`    Lỗi lấy history: ${e.message}`));
    continue;
  }

  const history = data.history || [];
  const next = data.predictions || [];

  if (next.length) {
    console.log(c.cyan(`    Lần chạy tiếp theo: ${fmt(next[0], tz)}`));
  }

  if (!history.length) {
    console.log(c.dim("    (chưa có lịch sử chạy)"));
    continue;
  }

  const ok = history.filter((h) => h.status === 1).length;
  console.log(c.dim(`    ${history.length} lần gần nhất — ${ok} OK, ${history.length - ok} lỗi`));
  console.log(c.dim("    " + "Thời gian".padEnd(30) + "Kết quả".padEnd(18) + "HTTP".padEnd(7) + "Thời lượng"));

  for (const h of history.sort((a, b) => b.date - a.date)) {
    const label = `${h.status === 1 ? "✔" : "✘"} ${STATUS[h.status] ?? h.status}`;
    const line =
      "    " +
      fmt(h.date, tz).padEnd(30) +
      label.padEnd(18) +
      String(h.httpStatus || "-").padEnd(7) +
      `${h.duration ?? "-"} ms`;
    console.log(h.status === 1 ? line : c.red(line));
    if (h.status !== 1 && h.statusText) console.log(c.dim(`        ${h.statusText}`));
  }
}
console.log();
