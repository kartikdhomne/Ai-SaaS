const User = require("../models/user");
const Article = require("../models/articles");
const AlertLog = require("../models/alertlog");
const sendAlert = require("../utils/sendAlert");

async function runAlerts() {
  const users = await User.find({ isActive: true });

  for (const user of users) {
    // ✅ skip if no stocks
    if (!user.stocks || user.stocks.length === 0) continue;

    // 🔥 YOUR QUERY GOES HERE
    const articles = await Article.find({
      stock: { $in: user.stocks },
      impactScore: { $gte: user.minImpactScore },
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    for (const article of articles) {
      const alreadySent = await AlertLog.findOne({
        userId: user._id,
        articleId: article._id
      });

      if (alreadySent) continue;

      await sendAlert(user, article);

      await AlertLog.create({
        userId: user._id,
        articleId: article._id
      });
    }
  }
}

module.exports = runAlerts;