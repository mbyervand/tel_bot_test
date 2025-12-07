// actions/main.js
const { Markup } = require("telegraf");
const dbActions = require("./dbActions.js");

/**
 * ثبت کاربر و ارسال پیام خوش آمد
 */
const registerUserAction = async (ctx) => {
  try {
    const existed = await dbActions.registerUser(
      ctx.chat.id,
      ctx.from?.first_name || "",
      ctx.from?.username || "",
      0
    );

    if (existed) {
      await ctx.reply(`ℹ️ کاربر ${ctx.from.username} قبلاً ثبت شده`);
    } else {
      await ctx.reply(`✔️ ثبت نام با موفقیت انجام شد`);
    }

    // پیام خوش آمد
    await ctx.reply(
      `${ctx.from?.first_name} عزیز 🌸\n` +
        `به نرم افزار صندوق های قرض الحسنه خوش آمدی`
    );

    // فعال کردن حالت دریافت شناسه صندوق
    ctx.session.awaitingBranchId = true;
    await ctx.reply("لطفاً *شناسه صندوق* خود را وارد کنید:", {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error("❌ خطا در ثبت کاربر:", err);
    await ctx.reply("❌ خطا در ثبت نام. لطفاً دوباره تلاش کنید.");
  }
};

/**
 * دریافت و بررسی شناسه صندوق
 */
const handleBranchId = async (ctx) => {
  try {
    const BranchId = ctx.message.text.trim();

    if (!/^2\d{3}$/.test(BranchId)) {
      await ctx.reply(
        "⚠️ شناسه صندوق باید 4 رقمی و با عدد *2* شروع شود.\nمثال: 2345",
        { parse_mode: "Markdown" }
      );
      return ctx.reply("دوباره وارد کنید.");
    }

    const Branch = await dbActions.getBranchById(BranchId);
    if (!Branch) {
      return ctx.reply("❌ چنین شناسه‌ای در سیستم ثبت نشده است.");
    }

    await ctx.reply(
      `✔️ شناسه صندوق *${BranchId}* معتبر است.\nنام صندوق: *${Branch.name}*`,
      { parse_mode: "Markdown" }
    );

    // فعال کردن دریافت کد ملی
    ctx.session.awaitingBranchId = false;
    ctx.session.awaitingNationalCode = true;
    ctx.session.BranchId = BranchId;
    await ctx.reply("لطفاً کد ملی خود را وارد کنید:");
  } catch (err) {
    console.error("❌ Error in handleBranchId:", err);
    await ctx.reply("❌ خطا در پردازش شناسه. لطفاً دوباره تلاش کنید.");
  }
};

/**
 * دریافت و ثبت کد ملی
 */
const handleNationalCode = async (ctx) => {
  try {
    const nationalCode = ctx.message.text.trim();
    if (!/^\d{10}$/.test(nationalCode)) {
      return ctx.reply("⚠️ کد ملی نامعتبر است. لطفاً 10 رقم وارد کنید.");
    }

    const chatId = ctx.chat.id;
    await dbActions.updateNationalCode(chatId, nationalCode);

    await ctx.reply(`✔️ کد ملی شما با موفقیت ثبت شد.`);

    // فعال کردن دریافت موبایل
    ctx.session.awaitingNationalCode = false;
    ctx.session.awaitingMobile = true;
    await ctx.reply("لطفاً شماره موبایل خود را وارد کنید:");
  } catch (err) {
    console.error("❌ Error in handleNationalCode:", err);
    await ctx.reply("❌ خطا در ثبت کد ملی. لطفاً دوباره تلاش کنید.");
  }
};

/**
 * دریافت و ثبت موبایل و ثبت اکشن
 */
const handleMobile = async (ctx) => {
  try {
    const mobile = ctx.message.text.trim();
    if (!/^09\d{8,9}$/.test(mobile)) {
      return ctx.reply(
        "⚠️ شماره موبایل نامعتبر است. لطفاً شماره را به صورت 09xxxxxxxx وارد کنید."
      );
    }

    const chatId = ctx.chat.id;
    await dbActions.updateMobile(chatId, mobile);

    // ثبت اکشن در جدول activity
    const BranchId = ctx.session.BranchId;
    const person = await dbActions.getPersonByChatId(chatId);
    const personId = person?.id || null;
    const flag = "0";

    if (BranchId) {
      await dbActions.addActivity({ BranchId, chatId, personId, flag });
      console.log("✔️ اطلاعات شما در اکشن با موفقیت ثبت شد.");
    }

    // پاک کردن session و نمایش منوی اصلی
    ctx.session.awaitingMobile = false;
    ctx.session.BranchId = null;
    await showMainMenu(ctx);
  } catch (err) {
    console.error("❌ Error in handleMobile:", err);
    await ctx.reply("❌ خطا در ثبت شماره موبایل. لطفاً دوباره تلاش کنید.");
  }
};

/**
 * نمایش منوی اصلی
 */
const showMainMenu = (ctx) => {
  return ctx.reply(
    "لطفاً یک گزینه انتخاب کنید:",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("سه گردش آخر", "3transaction"),
        Markup.button.callback("10 گردش آخر", "10transaction"),
      ],
      [
        Markup.button.callback("مانده حساب", "lastamount"),
        Markup.button.callback("مانده وام", "loanremaining"),
      ],
      [Markup.button.callback("راهنما", "help")],
    ])
  );
};

module.exports = {
  registerUserAction,
  handleBranchId,
  handleNationalCode,
  handleMobile,
  showMainMenu,
};
