const cron = require("node-cron");
const { fetchAndStoreNews } = require("../services/newsAggregator");
const runAlerts = require("../services/alertServices");

const startNewsCron = () => {
  console.log("⏰ News cron started...");

  // Every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("🔁 Running news job...");

    // 📰 Step 1–4
    await fetchAndStoreNews();

    // 🚨 Step 5.1 (ADD THIS)
    console.log("🚨 Running alert job...");
    await runAlerts();
  });
};

module.exports = { startNewsCron };