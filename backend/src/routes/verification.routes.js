const router = require("express").Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

/* =========================
   SEND VERIFICATION REQUEST
========================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photo_url } = req.body;

    if (!photo_url) {
      return res.status(400).json({ message: "Photo is required" });
    }

    // сохраняем фото и ставим флаг student=true
    await pool.query(
      `
      UPDATE users
      SET 
        verification_photo = $1,
        is_student = true,
        is_verified = false
      WHERE id = $2
      `,
      [photo_url, userId]
    );

    res.json({ message: "Verification request sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
