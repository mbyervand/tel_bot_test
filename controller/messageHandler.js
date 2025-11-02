module.exports = function handleMessage(platform, message) {
  const text = message.text || "";

  if (platform === "telegram") {
    if (/\/start/i.test(text)) return "👋 سلام! خوش آمدی به ربات تلگرام!";
    if (/\/help/i.test(text)) return "🆘 دستورات:\n/start - شروع\n/help - راهنما";
    return `📩 (تلگرام) پیامت دریافت شد: ${text}`;
  }

  if (platform === "bale") {
    if (/\/start/i.test(text)) return "👋 سلام! خوش آمدی به ربات بله!";
    if (/\/help/i.test(text)) return "🆘 دستورات:\n/start - شروع\n/help - راهنما";
    return `📩 (بله) پیامت دریافت شد: ${text}`;
  }

  return `📩 (ناشناخته) پیامت دریافت شد: ${text}`;
};
