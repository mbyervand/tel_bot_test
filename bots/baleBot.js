// const axios = require("axios");
// const handleCommand = require("../controller/commandHandler");

// const BALE_TOKEN = process.env.BALE_TOKEN;
// const API_URL = `https://tapi.bale.ai/bot${BALE_TOKEN}/`;

// async function handleRequest(req, res) {
//   try {
//     const message = req.body.message;

//     console.log("📨 پیام از بله (chatId:", message.chat.id, "):", message.text);

//     if (message.text?.startsWith("/start")) {
//       await startCommand.execute(message, "B"); // فلگ بله
//     }

//     res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error("❌ handleRequest error (Bale):", err);
//     res.sendStatus(500);
//   }
// }

// module.exports = { handleRequest };
const axios = require("axios");

const BALE_BOT_TOKEN = process.env.BALE_BOT_TOKEN;

async function baleHandler(payload) {
    const chatId = payload.sender.id;
    const text = payload.text || "";

    let reply = "پیام شما دریافت شد!";

    if (text === "/start") {
        reply = "سلام! خوش آمدید به ربات بله!";
    }

    await axios.post(`https://messenger.bale.ai/bot${BALE_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: reply,
    });
}

module.exports = baleHandler;
