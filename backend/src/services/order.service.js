exports.createOrder = async (data) => {
  const {
    user_id,
    total_amount,
    payment_method,
    delivery_lat,
    delivery_lng,
    coins_used = 0
  } = data;

  // Проверяем пользователя
  const [users] = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [user_id]
  );

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  // Проверка баланса
  if (coins_used > user.balance) {
    throw new Error("Not enough balance");
  }

  // Ограничение — максимум 50% можно оплатить баллами
  const maxAllowed = total_amount * 0.5;

  if (coins_used > maxAllowed) {
    throw new Error("You can use max 50% of order in coins");
  }

  // Итоговая сумма после использования coins
  const finalAmount = total_amount - coins_used;

  // Создаём заказ
  const [result] = await db.query(
    `INSERT INTO orders 
     (user_id, total_amount, payment_method, delivery_lat, delivery_lng)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, finalAmount, payment_method, delivery_lat, delivery_lng]
  );

  // Если использовали coins — списываем
  if (coins_used > 0) {
    await db.query(
      "UPDATE users SET balance = balance - ? WHERE id = ?",
      [coins_used, user_id]
    );
  }

  return {
    message: "Order created",
    order_id: result.insertId,
    paid_with_coins: coins_used,
    final_amount: finalAmount
  };
};
