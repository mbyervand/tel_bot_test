const { handleStart } = require("../handlers/startHandler");

async function handleCommand(payload, platform) {
  console.log("⚡ handleCommand payload:", payload);
  console.log("⚡ platform:", platform);

  // متن پیام
  const text = payload?.message?.text || payload?.text;
  if (!text) {
    console.log("⚠️ متن پیام پیدا نشد!", payload);
    return;
  }

  if (text === "/start") {
    await handleStart(payload, platform);
  } else {
    console.log(`دستور ناشناخته از ${platform}:`, text);
  }
}

module.exports = handleCommand;
