// app/bale/baleBot.js
const { getSetting } = require("../actions/dbActions");
const actions = require("../actions/main"); // توابع handleBranchId, handleNationalCode, handleMobile
const dbActions = require("../actions/dbActions"); // برای ثبت کاربر

let bot = null;

class BaleBot {
  constructor(token) {
    if (!token) throw new Error("توکن ربات Bale تنظیم نشده است!");
    this.token = token;
    this.API_URL = `https://tapi.bale.ai/bot${token}`;
    this.sessions = {}; // شبیه session تلگرام
  }

  async sendMessage(chatId, text) {
    try {
      await fetch(`${this.API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    } catch (err) {
      console.error("❌ Bale sendMessage error:", err);
    }
  }

  getSession(chatId) {
    if (!this.sessions[chatId]) this.sessions[chatId] = {};
    return this.sessions[chatId];
  }

  async handleUpdate(update) {
    const chatId = update?.message?.chat?.id || update?.sender?.id;
    const text = update?.message?.text || update?.text || "";
    const firstName = update?.message?.from?.first_name || "";
    const username = update?.message?.from?.username || "";

    if (!chatId) return;

    const session = this.getSession(chatId);

    // اگر کاربر /start فرستاد
    if (text === "/start") {
      // ثبت کاربر در دیتابیس
      try {
        const existed = await dbActions.registerUser(chatId, firstName, username, 0);
        if (existed) {
          await this.sendMessage(chatId, `ℹ️ شما قبلاً ثبت شده‌اید، ${firstName} عزیز.`);
        } else {
          await this.sendMessage(chatId, `✔️ ثبت نام با موفقیت انجام شد، ${firstName} عزیز.`);
        }
      } catch (err) {
        console.error("❌ خطا در ثبت کاربر:", err);
        await this.sendMessage(chatId, "❌ خطا در ثبت کاربر. دوباره تلاش کنید.");
      }

      session.awaitingBranchId = true;
      return this.sendMessage(
        chatId,
        `سلام ${firstName} عزیز! 🌸\nبه ربات بله خوش آمدی.\nلطفاً شناسه صندوق خود را وارد کنید:`
      );
    }

    // مدیریت مراحل
    if (session.awaitingBranchId)
      return actions.handleBranchId({
        message: { text },
        session,
        chat: { id: chatId },
        from: { first_name: firstName },
        reply: (msg) => this.sendMessage(chatId, msg),
      });

    if (session.awaitingNationalCode)
      return actions.handleNationalCode({
        message: { text },
        session,
        chat: { id: chatId },
        reply: (msg) => this.sendMessage(chatId, msg),
      });

    if (session.awaitingMobile)
      return actions.handleMobile({
        message: { text },
        session,
        chat: { id: chatId },
        reply: (msg) => this.sendMessage(chatId, msg),
      });

    // اگر هیچ مرحله‌ای فعال نبود
    return this.sendMessage(chatId, "❌ لطفاً ابتدا گزینه مورد نظر را انتخاب کنید.");
  }
}

// بارگذاری توکن از دیتابیس و ساخت instance
(async () => {
  const token = await getSetting("bale");
  if (!token) {
    console.error("❌ توکن Bale در جدول settings پیدا نشد");
    return;
  }

  bot = new BaleBot(token);
  console.log("🤖 Bale bot initialized from DB");
})();

module.exports = {
  handleRequest: async (req, res) => {
    try {
      if (!bot) {
        console.error("❌ Bale bot not ready yet");
        return res.sendStatus(500);
      }
      await bot.handleUpdate(req.body);
      res.sendStatus(200);
    } catch (err) {
      console.error("❌ Bale Webhook handleRequest error:", err);
      res.sendStatus(500);
    }
  },
};


// // app/bale/baleBot.js
// const axios = require("axios");
// const { getSetting } = require("../actions/dbActions");

// let bot = null;

// class BaleBot {
//   constructor(token) {
//     this.token = token;
//     this.API_URL = `https://tapi.bale.ai/bot${token}`;
//   }

//   async sendMessage(chatId, text) {
//     try {
//       await axios.post(`${this.API_URL}/sendMessage`, {
//         chat_id: chatId,
//         text: text,
//       });
//     } catch (err) {
//       console.error("❌ Bale sendMessage error:", err?.response?.data || err);
//     }
//   }

//   async handleUpdate(update) {
//     try {
//       const chatId =
//         update?.sender?.id ||
//         update?.message?.chat?.id;

//       if (!chatId) {
//         console.error("❌ Bale: chat id not detected");
//         return;
//       }

//       const text =
//         update?.text ||
//         update?.message?.text ||
//         "";

//       if (text === "/start") {
//         return this.sendMessage(chatId, "سلام! خوش اومدی به ربات بله 🌸");
//       }

//       return this.sendMessage(chatId, "پیام شما دریافت شد ✅");

//     } catch (err) {
//       console.error("❌ Bale handleUpdate error:", err);
//     }
//   }
// }

// (async () => {
//   const token = await getSetting("bale");

//   if (!token) {
//     console.error("❌ توکن Bale در جدول settings پیدا نشد");
//     return;
//   }

//   bot = new BaleBot(token);
//   console.log("🤖 Bale bot initialized from DB");
// })();

// module.exports = {
//   handleRequest: async (req, res) => {
//     try {
//       if (!bot) {
//         console.error("❌ Bale bot not ready yet");
//         return res.sendStatus(500);
//       }

//       await bot.handleUpdate(req.body);
//       res.sendStatus(200);

//     } catch (err) {
//       console.error("❌ Bale Webhook handleRequest error:", err);
//       res.sendStatus(500);
//     }
//   },
// };
