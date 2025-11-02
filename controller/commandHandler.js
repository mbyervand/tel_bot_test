const { handleStart } = require("../handlers/startHandler");

// تشخیص و هندل پیام ها
async function handleCommand(payload) {
  let platform;
  if (payload.message) {
    platform = "telegram";
  } else if (payload.fromId) {
    platform = "bale";
  }

  const text = payload.message?.text || payload.text;

  if (text === "/start") {
    await handleStart(payload, platform);
  } else {
    // سایر دستورات
    console.log(`دستور ناشناخته از ${platform}:`, text);
  }
}

module.exports = { handleCommand };
