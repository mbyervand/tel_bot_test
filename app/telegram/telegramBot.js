const { Telegraf, session } = require("telegraf");
const actions = require("../actions/main");
const { getSetting } = require("../actions/dbActions");

let bot;

(async () => {
  const token = await getSetting("telegram");
  if (!token) {
    console.error("❌ توکن یافت نشد!");
    process.exit(1);
  }

  bot = new Telegraf(token);

  bot.use(session());
  bot.use((ctx, next) => {
    if (!ctx.session) ctx.session = {};
    return next();
  });

  bot.start(actions.registerUserAction);

  bot.on("text", (ctx) => {
    if (ctx.session.awaitingBranchId) return actions.handleBranchId(ctx);
    if (ctx.session.awaitingNationalCode)
      return actions.handleNationalCode(ctx);
    if (ctx.session.awaitingMobile) return actions.handleMobile(ctx);

    return ctx.reply("❌ لطفاً ابتدا گزینه مورد نظر را انتخاب کنید.");
  });
})();

module.exports = {
  handleRequest: async (req, res) => {
    try {
      await bot.handleUpdate(req.body);
      res.sendStatus(200);
    } catch (err) {
      console.error("❌ handleRequest error:", err);
      res.sendStatus(500);
    }
  },
};

