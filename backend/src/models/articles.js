const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String,
    image: String,
    source: String,
    publishedAt: Date,

    // 🔥 NEW FIELDS
    stocks: [String], // ["RELIANCE", "TCS"]
    hash: { type: String, unique: true }, // deduplication
    importance: { type: Number, default: 0 }, // scoring
});

module.exports = mongoose.model("Article", articleSchema);