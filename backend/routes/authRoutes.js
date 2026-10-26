
const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

router.post("/admin/login", authController.adminLogin);

router.post("/token", authController.tokenLogin);

router.get(
  "/me",
  authenticateToken,
  authController.getMe
);

router.post(
  "/logout",
  authenticateToken,
  authController.logout
);

module.exports = router;