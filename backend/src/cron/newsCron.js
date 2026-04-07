const cron = require("node-cron");
const { fetchAndStoreNews } = require("../services/news/newsAggregator");

const startNewsCron = () => {
  cron.schedule("*/15 * * * *", async () => {
    console.log("🚀 Running news cron...");
    await fetchAndStoreNews();
  });
};

module.exports = startNewsCron;
