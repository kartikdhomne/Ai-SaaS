const axios = require("axios");
const crypto = require("crypto");

const Article = require("../models/articles");
const User = require("../models/user");

const { sendTelegramAlert } = require("../services/alertServices");

const IMPORTANT_KEYWORDS = [
  "earnings",
  "profit",
  "loss",
  "merger",
  "acquisition",
  "ipo",
];

const getImportance = (title) => {
  return IMPORTANT_KEYWORDS.some((k) =>
    title.toLowerCase().includes(k)
  )
    ? 1
    : 0;
};

const generateHash = (article) => {
  return crypto
    .createHash("md5")
    .update(article.title + article.source)
    .digest("hex");
};

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

const fetchMarketaux = async () => {
  const { data } = await axios.get(
    "https://api.marketaux.com/v1/news/all",
    {
      params: {
        api_token: process.env.MARKETAUX_API_KEY,
        language: "en",
        countries: "in",
      },
    }
  );

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

    // ✅ FETCH USERS ONCE
    const users = await User.find();

    for (let article of allNews) {
      console.log("👉 Checking:", article.title);

      const hash = generateHash(article);

      // ❌ skip duplicates
      // const exists = await Article.findOne({ hash });
      // if (exists) {
      //   console.log("⏭️ Skipped duplicate");
      //   continue;
      // }

      const importance = getImportance(article.title);

      // ✅ STORE ARTICLE (no stock dependency now)
      await Article.create({
        ...article,
        hash,
        importance,
      });

      console.log("✅ Stored:", article.title);

      // 🔥 USER-BASED ALERT LOGIC
      for (let user of users) {
        const userStocks = user.stocks || [];

        const matchedStocks = userStocks.filter((stock) =>
          (article.title + " " + article.description)
            .toLowerCase()
            .includes(stock.toLowerCase())
        );

        if (matchedStocks.length === 0) continue;

        console.log(
          `📊 Match for ${user.email}:`,
          matchedStocks
        );

        // ✅ ONLY IMPORTANT NEWS (optional)
        if (importance === 1) {
          console.log("📲 Sending alert to user...");

          await sendTelegramAlert({
            ...article,
            stocks: matchedStocks,
            chatId: user.telegramChatId,
          });
        }
      }
    }

    console.log("🎉 News aggregation complete");
  } catch (err) {
    console.error("❌ Aggregator error:", err.message);
  }
};

module.exports = { fetchAndStoreNews };