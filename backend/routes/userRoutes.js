"use strict";

require("dotenv").config();
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/admin/users", userController.createAccount);

module.exports = router;