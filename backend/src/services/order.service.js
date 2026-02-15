const pool = require("../config/db");

/* ===============================
   CREATE ORDER
=============================== */
const createOrder = async (data) => {
  const { user_id, total_price, delivery_address, latitude, longitude } = data;

  const result = await pool.query(
    `INSERT INTO orders 
      (user_id, total_price, delivery_address, latitude, longitude, status, coins_awarded)
     VALUES ($1, $2, $3, $4, $5, 'pending', false)
     RETURNING *`,
    [user_id, total_price, delivery_address, latitude, longitude]
  );

  return result.rows[0];
};

/* ===============================
   UPDATE STATUS + CASHBACK
=============================== */
const updateStatus = async (id, status) => {

  // Получаем заказ
  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [id]
  );

  if (orderRes.rows.length === 0) {
    throw new Error("Order not found");
  }

  const order = orderRes.rows[0];

  // Обновляем статус
  const updatedRes = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
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

      // начисляем баланс
      await pool.query(
        `UPDATE users
         SET balance = balance + $1
         WHERE id = $2`,
        [cashback, order.user_id]
      );

      // помечаем что начислено
      await pool.query(
        `UPDATE orders
         SET coins_awarded = true
         WHERE id = $1`,
        [id]
      );
    }
  }

  return updatedRes.rows[0];
};

module.exports = {
  createOrder,
  updateStatus
};
