"use strict";

require("dotenv").config();
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/admin/users", authenticateToken, authorizeRoles("admin"), userController.createAccount);

module.exports = router;