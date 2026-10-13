"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Prefix
app.use("/api/user", userRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bimbel Pilar Backend API is running smoothly!"
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || []
  });
});

// Menyalakan Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});