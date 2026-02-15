const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/* ===============================
   CREATE ORDER
=============================== */
router.post("/", async (req, res) => {
  try {
    const { user_id, total_price, delivery_address, latitude, longitude } = req.body;

    const result = await pool.query(
      `INSERT INTO orders 
       (user_id, total_price, delivery_address, latitude, longitude, status, coins_awarded)
       VALUES ($1, $2, $3, $4, $5, 'pending', false)
       RETURNING *`,
      [user_id, total_price, delivery_address, latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/* ===============================
   UPDATE ORDER STATUS
=============================== */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Получаем заказ
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRes.rows[0];

    // Обновляем статус
    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [status, orderId]
    );

    /* ===============================
       CASHBACK LOGIC
    =============================== */

    if (
      status === "delivered" &&
      order.coins_awarded === false
    ) {
      const userRes = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [order.user_id]
      );

      const user = userRes.rows[0];

      if (user && user.is_verified === true) {
        const cashback = Number(order.total_price) * 0.05;

        await pool.query(
          `UPDATE users 
           SET balance = balance + $1 
           WHERE id = $2`,
          [cashback, order.user_id]
        );

        await pool.query(
          `UPDATE orders 
           SET coins_awarded = true 
           WHERE id = $1`,
          [orderId]
        );
      }
    }

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;
