// const axios = require("axios");
// const handleMessage = require("../controller/messageHandler");
// const handleCommand = require("../controller/commandHandler");
// const { Telegraf } = require("telegraf");

// const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// // ============================
// // Polling Mode (برای تست محلی)
// // ============================
// bot.start((ctx) => ctx.reply("👋 سلام! خوش آمدی به ربات تلگرام!"));
// bot.help((ctx) => ctx.reply("🆘 دستورات:\n/start - شروع\n/help - راهنما"));

// bot.on("text", async (ctx) => {
//   const text = ctx.message?.text || "";
//   console.log(`📨 پیام از تلگرام (chatId: ${ctx.chat.id}): ${text}`);

//   // ارسال پاسخ با handleMessage
//   const reply = handleMessage("telegram", ctx.message);
//   console.log("✉️ پاسخ:", reply);

//   await ctx.reply(reply);
// });

// // ============================
// // Webhook Mode
// // ============================
// async function handleRequest(req, res) {
//   try {
//     const message = req.body.message;
//     const chatId = message?.chat?.id;
//     const text = message?.text || "";

//     console.log(`📨 پیام از تلگرام (chatId: ${chatId}): ${text}`);

//     if (!chatId) {
//       return res.status(400).json({ ok: false, error: "Invalid chat_id" });
//     }

//     // روش ماژولار: استفاده از handleCommand
//     await handleCommand("telegram", message, async (msg, replyText) => {
//       console.log("✉️ ارسال پاسخ:", replyText);
//       await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
//         chat_id: chatId,
//         text: replyText,
//         parse_mode: "HTML"
//       });
//     });

//     // پاسخ به webhook تلگرام
//     res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error("❌ handleRequest error:", err);
//     res.sendStatus(500);
//   }
// }

// module.exports = { bot, handleRequest };

const axios = require("axios");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function telegramHandler(message) {
    const chatId = message.chat.id;
    const text = message.text || "";

    let reply = "پیام شما دریافت شد!";

    if (text === "/start") {
        reply = "سلام! خوش آمدید به ربات تلگرام!";
    }

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: reply,
        parse_mode: "HTML"
    });
}

module.exports = telegramHandler;
