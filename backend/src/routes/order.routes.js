const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Создать заказ
router.post("/", orderController.createOrder);

// Обновить статус заказа
router.post("/:id/status", orderController.updateStatus);

module.exports = router;
