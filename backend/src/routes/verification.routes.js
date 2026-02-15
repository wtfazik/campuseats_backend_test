const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");

/* =========================
   SEND VERIFICATION REQUEST
========================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photo_url } = req.body;

    if (!photo_url) {
      return res.status(400).json({ message: "Photo URL required" });
    }

    // сохраняем запрос верификации
    await pool.query(
      `UPDATE users
       SET is_student = true,
           verification_photo = $1
       WHERE id = $2`,
      [photo_url, userId]
    );

    res.json({ message: "Verification request sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
s