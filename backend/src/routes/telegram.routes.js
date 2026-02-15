const router = require("express").Router();
const axios = require("axios");
const pool = require("../config/db");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/* =========================
   TELEGRAM WEBHOOK
========================= */

router.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    /* =========================
       CALLBACK BUTTONS
    ========================== */

    if (body.callback_query) {
      const callback = body.callback_query;
      const data = callback.data; // verify_approve_12
      const callbackId = callback.id;

      if (data.startsWith("verify_")) {
        const parts = data.split("_");
        const action = parts[1];     // approve / reject / retry
        const verificationId = parts[2];

        const result = await pool.query(
          "SELECT * FROM verification_requests WHERE id = $1",
          [verificationId]
        );

        if (result.rows.length === 0) {
          return res.status(200).end();
        }

        const request = result.rows[0];

        /* ===== APPROVE ===== */

        if (action === "approve") {
          await pool.query(
            "UPDATE verification_requests SET status='approved' WHERE id=$1",
            [verificationId]
          );

          await pool.query(
            "UPDATE users SET is_verified=true WHERE id=$1",
            [request.user_id]
          );
        }

        /* ===== REJECT ===== */

        if (action === "reject") {
          await pool.query(
            "UPDATE verification_requests SET status='rejected' WHERE id=$1",
            [verificationId]
          );
        }

        /* ===== RETRY ===== */

        if (action === "retry") {
          await pool.query(
            "UPDATE verification_requests SET status='retry' WHERE id=$1",
            [verificationId]
          );
        }

        /* ===== REMOVE BUTTONS AFTER CLICK ===== */

        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageReplyMarkup`,
          {
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            reply_markup: { inline_keyboard: [] }
          }
        );

        /* ===== ANSWER CALLBACK ===== */

        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
          {
            callback_query_id: callbackId,
            text: "Updated"
          }
        );
      }
    }

    res.status(200).end();

  } catch (err) {
    console.error(err);
    res.status(200).end();
  }
});

module.exports = router;
