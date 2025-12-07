require("dotenv").config(); // برای خواندن env
const mysql = require("mysql2/promise");

// ⬇ ایجاد Pool اتصال
const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "@root1234",
  database: process.env.DB_NAME || "fapna_sandogh",
});

// ⬇ گرفتن مقدار تنظیمات از جدول setting
async function getSetting(key) {
  const [rows] = await connection.query(
    "SELECT token FROM setting WHERE name = ? LIMIT 1",
    [key]
  );
  return rows.length ? rows[0].token : null;
}

// ⬇ ثبت یا خواندن کاربر
const registerUser = async (chatId, name, username, flag) => {
  try {
    // 1️⃣ بررسی وجود کاربر
    const [rows] = await connection.query(
      "SELECT * FROM persons WHERE chat_id = ?",
      [chatId]
    );

    // 2️⃣ اگر کاربر وجود نداشت، ثبت کن
    if (rows.length === 0) {
      await connection.query(
        "INSERT INTO persons (chat_id, name, username, flag) VALUES (?, ?, ?, ?)",
        [chatId, name, username, flag]
      );
      // console.log(`✅ کاربر ${username || chatId} ثبت شد`);
    } 
    // else {
    //   await connection.query(
    //     "INSERT INTO persons (chat_id, name, username, flag) VALUES (?, ?, ?, ?)",
    //     [chatId, name, username, flag]
    // }

    return rows;
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    throw err;
  }
};

async function getBranchById(BranchId) {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM Branch WHERE Branch = ?",
      [BranchId]
    );

    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("❌ Error getBranchById:", err);
    return null;
  }
}
async function updateNationalCode(chatId, nationalCode) {
  try {
    const [result] = await connection.query(
      "UPDATE persons SET national_code = ? WHERE chat_id = ?",
      [nationalCode, chatId]
    );
    return result;
  } catch (err) {
    console.error("❌ Error in updateNationalCode:", err);
    throw err;
  }
}
async function updateMobile(chatId, mobile) {
  try {
    const [result] = await connection.query(
      "UPDATE persons SET mobile = ? WHERE chat_id = ?",
      [mobile, chatId]
    );
    console.log(
      `✅ شماره موبایل برای chatId=${chatId} به‌روزرسانی شد: ${mobile}`
    );
    return result;
  } catch (err) {
    console.error("❌ Error in updateMobile:", err);
    throw err;
  }
}

// اضافه کردن اکشن جدید به جدول actions
async function addActivity({ BranchId, chatId, personId, flag }) {
  try {
    const [activ] = await connection.query(
      "SELECT * FROM activity WHERE chat_id = ? AND branch_id = ? AND flag=?",
      [chatId, BranchId]
    );

    // اگر اکشنی برای این چت و شعبه وجود نداشت → ایجاد کن
    if (activ.length === 0) {
      await connection.query(
        "INSERT INTO activity (branch_id, chat_id, persons_id, flag) VALUES (?, ?, ?, ?)",
        [BranchId, chatId, personId, flag]
      );
      console.log(
        `🟢 اکشن جدید ساخته شد: BranchId=${BranchId}, chatId=${chatId}, personId=${personId}, flag=${flag}`
      );
      return;
    }

  } catch (err) {
    console.error("❌ خطا در ثبت اکشن:", err);
    throw err;
  }
}

// گرفتن اطلاعات کاربر از جدول persons بر اساس chatId
async function getPersonByChatId(chatId) {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM persons WHERE chat_id = ? LIMIT 1",
      [chatId]
    );
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("❌ Error in getPersonByChatId:", err);
    return null;
  }
}

module.exports = {
  connection,
  getSetting,
  registerUser,
  getBranchById,
  updateNationalCode,
  updateMobile,
  addActivity,
  getPersonByChatId,
};
