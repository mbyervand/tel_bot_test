const express = require("express");
const telegramService = require("./app/telegram/telegramBot");
const baleService = require("./app/bale/baleBot.js");
const detectPlatform = require("./app/middlewares/detectPlatform.js");

const app = express();
app.use(express.json());

// Trust proxy برای Cloudflare
app.set("trust proxy", true);

// -----------------------------
// Webhook مخصوص Telegram
// -----------------------------
app.post("/webhook/telegram", detectPlatform, async (req, res) => {
  try {
    await telegramService.handleRequest(req, res);
  } catch (err) {
    console.error("❌ Telegram webhook error:", err);
    res.sendStatus(500);
  }
});

// -----------------------------
// Webhook مخصوص Bale
// -----------------------------
app.post("/webhook/bale", detectPlatform, async (req, res) => {
  try {
    await baleService.handleRequest(req, res);
  } catch (err) {
    console.error("❌ Bale webhook error:", err);
    res.sendStatus(500);
  }
});

// -----------------------------
// اجرا روی پورت از ENV یا 5000
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
