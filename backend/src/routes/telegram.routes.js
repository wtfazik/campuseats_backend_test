const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegram.controller");

router.post("/sync", telegramController.syncTelegramUser);

module.exports = router;
