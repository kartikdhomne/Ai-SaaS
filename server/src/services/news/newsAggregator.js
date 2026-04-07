const axios = require("axios");
const crypto = require("crypto");
// const Article = require("../models/Article");
const Article = require("../");

// 🔥 USER STOCKS (later from DB)
const TRACKED_STOCKS = [
  { name: "Reliance", symbol: "RELIANCE" },
  { name: "TCS", symbol: "TCS" },
  { name: "HDFC Bank", symbol: "HDFCBANK" },
];

// 🔥 KEYWORDS FOR PRIORITY
const IMPORTANT_KEYWORDS = [
  "earnings",
  "profit",
  "loss",
  "merger",
  "acquisition",
  "ipo",
];

// 🧠 STOCK MATCHING
const matchStocks = (article) => {
  const text = (article.title + " " + article.description).toLowerCase();

  return TRACKED_STOCKS.filter(
    (stock) =>
      text.includes(stock.name.toLowerCase()) ||
      text.includes(stock.symbol.toLowerCase()),
  ).map((s) => s.symbol);
};

// 🧠 IMPORTANCE SCORE
const getImportance = (title) => {
  return IMPORTANT_KEYWORDS.some((k) => title.toLowerCase().includes(k))
    ? 1
    : 0;
};

// 🧠 HASH (DEDUP)
const generateHash = (article) => {
  return crypto
    .createHash("md5")
    .update(article.title + article.source)
    .digest("hex");
};

// 🔥 FETCH FROM FINNHUB
const fetchFinnhub = async () => {
  const { data } = await axios.get("https://finnhub.io/api/v1/news", {
    params: {
      category: "general",
      token: process.env.FINNHUB_API_KEY,
    },
  });

  return data.map((item) => ({
    title: item.headline,
    description: item.summary,
    url: item.url,
    image: item.image,
    source: item.source,
    publishedAt: new Date(item.datetime * 1000),
  }));
};

// 🔥 FETCH FROM MARKETAUX
const fetchMarketaux = async () => {
  const { data } = await axios.get("https://api.marketaux.com/v1/news/all", {
    params: {
      api_token: process.env.MARKETAUX_API_KEY,
      language: "en",
    },
  });

  return data.data.map((item) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    image: item.image_url,
    source: item.source,
    publishedAt: new Date(item.published_at),
  }));
};

// 🚀 MAIN AGGREGATOR
const fetchAndStoreNews = async () => {
  try {
    console.log("⏳ Fetching news...");

    const [finnhubNews, marketauxNews] = await Promise.all([
      fetchFinnhub(),
      fetchMarketaux(),
    ]);

    const allNews = [...finnhubNews, ...marketauxNews];

    for (let article of allNews) {
      const hash = generateHash(article);

      const exists = await Article.findOne({ hash });
      if (exists) continue;

      const matchedStocks = matchStocks(article);
      if (matchedStocks.length === 0) continue;

      const importance = getImportance(article.title);

      await Article.create({
        ...article,
        stocks: matchedStocks,
        hash,
        importance,
      });

      console.log("✅ Stored:", article.title);
    }

    console.log("🎉 News aggregation complete");
  } catch (err) {
    console.error("❌ Aggregator error:", err.message);
  }
};

module.exports = { fetchAndStoreNews };
