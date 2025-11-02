// require("dotenv").config();
// const express = require("express");
// const telegramService = require("./bots/telegramBot");
// const baleService = require("./bots/baleBot");
// const detectPlatform = require("./middlewares/detectPlatform");

// const app = express();
// app.use(express.json());

// // Trust proxy برای Cloudflare
// app.set("trust proxy", true);

// // Webhook همه پیام‌ها
// // app.post("/webhook", detectPlatform, async (req, res) => {
// //   console.log("🌐 Detected platform:", req.platform, "IP:", req.realIp);

// //   try {
// //     if (req.platform === "telegram") {
// //       await telegramService.handleRequest(req, res);
// //     } else if (req.platform === "bale") {
// //       await baleService.handleRequest(req, res);
// //     } else {
// //       res.status(400).json({ ok: false, error: "Unknown platform" });
// //     }
// //   } catch (err) {
// //     console.error("❌ Webhook error:", err);
// //     res.sendStatus(500);
// //   }
// // });

// // app.post("/webhook", detectPlatform, async (req, res) => {
// //   console.log("🌐 Detected platform:", req.platform, "IP:", req.realIp);
// //   console.log("📦 Full payload:", req.body); // اضافه کن برای debug

// //   try {
// //     if (req.platform === "telegram") {
// //       await telegramService.handleRequest(req, res);
// //     } else if (req.platform === "bale") {
// //       await baleService.handleRequest(req, res);
// //     } else {
// //       res.status(400).json({ ok: false, error: "Unknown platform" });
// //     }
// //   } catch (err) {
// //     console.error("❌ Webhook error:", err);
// //     res.sendStatus(500);
// //   }
// // });

// // app.post("/webhook", detectPlatform, async (req, res) => {
// //   console.log("🌐 Detected platform:", req.platform);
// //   console.log("📦 Full payload:", req.body);

// //   res.status(200).json({ ok: true });
// // });

// app.post("/webhook", detectPlatform, async (req, res) => {
//   console.log("🌐 Handling webhook for platform:", req.platform);

//   try {
//     if (req.platform === "telegram") {
//       await telegramService.handleRequest(req, res);
//     } else if (req.platform === "bale") {
//       await baleService.handleRequest(req, res);
//     } else {
//       res.status(400).json({ ok: false, error: "Unknown platform" });
//     }
//   } catch (err) {
//     console.error("❌ Webhook handler error:", err);
//     res.sendStatus(500);
//   }
// });
// // توقف Telegraf با سیگنال‌ها
// process.once("SIGINT", () => telegramService.bot.stop("SIGINT"));
// process.once("SIGTERM", () => telegramService.bot.stop("SIGTERM"));

// // راه‌اندازی سرور
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// // شروع تلگرام با polling
// if (process.env.TELEGRAM_MODE === "polling") {
//   telegramService.bot.launch().then(() => console.log("🚀 Telegram bot polling started"));
// }

const express = require("express");
const bodyParser = require("body-parser");
const telegramHandler = require("./bots/telegramBot");
const baleHandler = require("./bots/baleBot");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
    console.log("Incoming request IP:", req.ip);
    console.log("Full payload:", req.body);

    let platform, flag;

    if (req.body.message?.chat?.id) {
        platform = "telegram";
        flag = "T";
    } else if (req.body.sender?.id) {
        platform = "bale";
        flag = "B";
    } else {
        platform = "unknown";
        flag = "U";
    }

    console.log(`Detected platform: ${platform} Flag: ${flag}`);

    try {
        if (platform === "telegram") {
            await telegramHandler(req.body.message);
        } else if (platform === "bale") {
            await baleHandler(req.body);
        } else {
            console.log("Unknown platform, ignoring message");
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(`${platform} handler error:`, err.response?.data || err.message);
        res.sendStatus(500);
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));

