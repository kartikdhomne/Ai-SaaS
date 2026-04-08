async function sendAlert(user, article) {
    // 📲 TELEGRAM
    if (
        user.notificationChannels?.includes("telegram") &&
        user.telegramChatId
    ) {
        console.log(`Telegram → ${article.title}`);
    }

    // 📩 EMAIL
    if (
        user.notificationChannels?.includes("email") &&
        user.email
    ) {
        console.log(`Email → ${article.title}`);
    }
}

module.exports = sendAlert;