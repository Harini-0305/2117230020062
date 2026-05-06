// logging_middleware/index.js
const LOG_API = "http://20.207.122.201/evaluation-service/logs";

async function Log(stack, level, package_, message) {
  const validStacks = ["backend", "frontend"];
  const validLevels = ["debug", "info", "warn", "error", "fatal"];
  const backendPackages = ["cache","controller","cron_job","db","domain","handler","repository","route","service"];
  const sharedPackages = ["auth","config","middleware","utils"];
  const validPackages = [...backendPackages, ...sharedPackages];

  if (!validStacks.includes(stack)) throw new Error(`Invalid stack: ${stack}`);
  if (!validLevels.includes(level)) throw new Error(`Invalid level: ${level}`);
  if (!validPackages.includes(package_)) throw new Error(`Invalid package: ${package_}`);

  try {
    const res = await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`
      },
      body: JSON.stringify({ stack, level, package: package_, message })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
}

module.exports = { Log };