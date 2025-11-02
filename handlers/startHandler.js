const axios = require("axios");
const { TELEGRAM_TOKEN, BALE_TOKEN } = process.env;

// هندلر Start
async function handleStart(payload, platform) {
  try {
    if (platform === "telegram") {
      const chatId = payload.message.chat.id;
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "سلام! خوش آمدی به ربات تلگرام!",
        parse_mode: "HTML",
      });
      console.log("پیام start به تلگرام ارسال شد.");
    } else if (platform === "bale") {
      const chatId = payload.fromId; // id کاربر در بله
      await axios.post(`https://api.bale.ai/bot${BALE_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "سلام! خوش آمدی به ربات بله!",
      });
      console.log("پیام start به بله ارسال شد.");
    } else {
      console.log("پلتفرم ناشناخته:", platform);
    }
  } catch (error) {
    console.error("❌ خطا در ارسال پیام start:", error.response ? error.response.data : error.message);
  }
}

module.exports = { handleStart };
