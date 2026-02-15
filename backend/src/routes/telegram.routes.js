const router = require("express").Router();
const axios = require("axios");
const pool = require("../config/db");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_ID = "-1003714441392";

/*
=========================================
WEBHOOK ENTRY POINT
=========================================
*/

router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    // 1️⃣ Если нажали кнопку
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;

/*
=========================================
HANDLE CALLBACK
=========================================
*/

async function handleCallback(callbackQuery) {
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  if (!data) return;

  const [action, userId] = data.split(":");

  if (!userId) return;

  if (action === "approve") {
    await pool.query(
      `UPDATE users SET is_verified = true WHERE id = $1`,
      [userId]
    );

    await editMessage(messageId, "✅ Verification approved");

  } else if (action === "reject") {
    await pool.query(
      `UPDATE users SET is_verified = false WHERE id = $1`,
      [userId]
    );

    await editMessage(messageId, "❌ Verification rejected");

  } else if (action === "retry") {
    await pool.query(
      `UPDATE users SET verification_photo = NULL WHERE id = $1`,
      [userId]
    );

    await editMessage(messageId, "🔄 New photo requested");
  }
}

/*
=========================================
EDIT MESSAGE
=========================================
*/

async function editMessage(messageId, text) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`,
    {
      chat_id: GROUP_ID,
      message_id: messageId,
      caption: text
    }
  );
}
