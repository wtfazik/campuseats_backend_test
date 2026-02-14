const authService = require("../services/auth.service");

async function telegramAuth(req, res, next) {
  try {
    const { telegram_id, username } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ message: "Telegram ID required" });
    }

    const user = await authService.findOrCreateUser(
      telegram_id,
      username
    );

    const token = authService.generateToken(user);

    res.json({
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { telegramAuth };
