const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

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
