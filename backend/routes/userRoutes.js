"use strict";

require("dotenv").config();
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, authorizeRoles("admin"), userController.createAccount);
router.get("/", authenticateToken, authorizeRoles("admin"), userController.getAllUsers);
router.put("/:id", authenticateToken, authorizeRoles("admin"), userController.updateUserData);
router.put("/:id/token", authenticateToken, authorizeRoles("admin"), userController.updateAccessToken);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), userController.deleteUserAccount);

module.exports = router;