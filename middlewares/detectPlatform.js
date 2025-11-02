module.exports = function detectPlatform(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(",")[0].trim() || req.ip;
    req.realIp = ip;
    const body = req.body || {};

    console.log("🌐 Incoming request IP:", ip);
    console.log("📦 Full payload:", JSON.stringify(body, null, 2));

    // تلگرام
    if (body.update_id && body.message) {
      req.platform = "telegram";
      req.flag = "T";
    }
    // بله
    else if (body.message && body.message.chat && body.message.chat.id) {
      req.platform = "bale";
      req.flag = "B";
    }
    else {
      req.platform = "unknown";
      req.flag = "U";
    }

    console.log("🔹 Detected platform:", req.platform, "Flag:", req.flag);
    next();
  } catch (err) {
    console.error("❌ detectPlatform error:", err);
    req.platform = "unknown";
    req.flag = "U";
    next();
  }
};
