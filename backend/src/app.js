const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/restaurants", require("./routes/restaurant.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(errorMiddleware);

module.exports = app;
