const express = require("express");
const router = express.Router();

const { fetchAndStoreNews } = require("../services/news/newsAggregator");

// 🧪 Test route
router.get("/test-news", async (req, res) => {
    try {
        await fetchAndStoreNews();
        res.send("✅ News fetched");
    } catch (err) {
        res.status(500).send("❌ Error fetching news");
    }
});

module.exports = router;