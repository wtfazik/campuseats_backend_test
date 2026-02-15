const router = require("express").Router();
const axios = require("axios");
const pool = require("../config/db");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/* =================================
   WEBHOOK (Telegram calls this)
================================= */

router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    console.log("Telegram update:", JSON.stringify(update));

    // =========================
    // CALLBACK BUTTON HANDLER
    // =========================

    if (update.callback_query) {
      const callback = update.callback_query;
      const data = callback.data;
      const chatId = callback.message.chat.id;
      const messageId = callback.message.message_id;

      // Example: approve_8
      if (data.startsWith("approve_")) {
        const userId = data.split("_")[1];

        await pool.query(
          "UPDATE users SET is_verified = true WHERE id = $1",
          [userId]
        );

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
          {
            chat_id: chatId,
            message_id: messageId,
            text: `✅ User ${userId} VERIFIED`
          }
        );
      }

      if (data.startsWith("reject_")) {
        const userId = data.split("_")[1];

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
          {
            chat_id: chatId,
            message_id: messageId,
            text: `❌ User ${userId} REJECTED`
          }
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err.message);
    res.sendStatus(200);
  }
});

module.exports = router;
