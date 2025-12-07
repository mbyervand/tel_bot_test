module.exports = function detectPlatform(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(",")[0].trim() || req.ip;
    req.realIp = ip;

    console.log("🌐 Incoming request IP:", ip);
    console.log("📦 Full payload:", JSON.stringify(req.body || {}, null, 2));

    // تشخیص بر اساس مسیر endpoint
    if (req.path.includes("/webhook/bale")) {
      req.platform = "bale";
      req.flag = "B";
    } else if (req.path.includes("/webhook/telegram")) {
      req.platform = "telegram";
      req.flag = "T";
    } else {
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
