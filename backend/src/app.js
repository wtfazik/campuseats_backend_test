const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/db");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

/* ======================
   GLOBAL MIDDLEWARE
====================== */

app.use(helmet());
app.use(cors());
app.use(express.json());

/* ======================
   SYSTEM ROUTES
====================== */

app.get("/", (req, res) => {
  res.json({ message: "CampusEats API running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ======================
   TEMP DB INIT ROUTE
   (will remove later)
====================== */

app.get("/init-db", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        total_price NUMERIC(10,2),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        delivery_address TEXT,
        coins_awarded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ message: "Tables created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB init failed" });
  }
});

/* ======================
   API ROUTES
====================== */

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/restaurants", require("./routes/restaurant.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

/* ======================
   ERROR HANDLER
====================== */

app.use(errorMiddleware);

module.exports = app;
