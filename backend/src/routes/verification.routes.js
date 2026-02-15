const router = require("express").Router();
const axios = require("axios");
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_ID = "-1003714441392";

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photo_url } = req.body;

    if (!photo_url) {
      return res.status(400).json({ message: "Photo required" });
    }

    // Сохраняем в БД
    await pool.query(
      `UPDATE users SET verification_photo = $1 WHERE id = $2`,
      [photo_url, userId]
    );

    // Отправляем фото в группу
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        chat_id: GROUP_ID,
        photo: photo_url,
        caption: `New verification request\nUser ID: ${userId}`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Approve",
                callback_data: `approve:${userId}`
              },
              {
                text: "❌ Reject",
                callback_data: `reject:${userId}`
              }
            ],
            [
              {
                text: "🔄 Request new photo",
                callback_data: `retry:${userId}`
              }
            ]
          ]
        }
      }
    );

    res.json({ message: "Verification request sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
