const router = require("express").Router();
const orderService = require("../services/order.service");
const authMiddleware = require("../middleware/auth.middleware");

/* =========================
   CREATE ORDER
========================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id; // берем из токена

    const {
      total_price,
      delivery_address,
      latitude,
      longitude
    } = req.body;

    if (!total_price || !delivery_address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await orderService.createOrder({
      user_id,
      total_price,
      delivery_address,
      latitude,
      longitude
    });

    res.status(201).json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
