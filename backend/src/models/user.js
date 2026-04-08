const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,

    // 📩 Email (optional but important)
    email: {
        type: String,
    },

    // 📈 User selected stocks
    stocks: {
        type: [String], // ["RELIANCE", "TCS"]
        default: [],
    },

    // 🎯 Alert quality control
    minImpactScore: {
        type: Number,
        default: 6,
    },

    // 🔔 Notification channels
    notificationChannels: {
        type: [String], // ["email", "telegram"]
        default: ["telegram"],
    },

    // 📲 Telegram
    telegramChatId: String,

    // 🟢 Active toggle
    isActive: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);