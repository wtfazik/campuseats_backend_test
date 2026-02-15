const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorMiddleware = require("./middleware/error.middleware");
const pool = require("./config/db");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/restaurants", require("./routes/restaurant.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/reviews", require("./routes/review.routes")); // 🔥 НОВОЕ

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* =========================
   TEMP TELEGRAM MIGRATION
   ⚠️ удалить после выполнения
========================= */

app.get("/migrate-telegram", async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
      ADD COLUMN IF NOT EXISTS username TEXT,
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS photo_url TEXT;
    `);

    res.json({ message: "Telegram fields added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Migration failed" });
  }
});

/* =========================
   ERROR HANDLER
========================= */

app.use(errorMiddleware);

module.exports = app;
