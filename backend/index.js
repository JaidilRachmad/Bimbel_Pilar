"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const kelasRoutes = require("./routes/kelasRoutes");
const sppRoutes = require("./routes/sppRoutes");

const app = express();
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT belum dikonfigurasi di file .env.");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// swagger
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Bimbel Pilar API Documentation",
//       version: "1.0.0",
//       description: "Dokumentasi API backend untuk Sistem Informasi Administrasi dan Pembelajaran Bimbel Pilar Cendekia[cite: 17].",
//     },
//     servers: [
//       {
//         url: "/",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//           description: "Masukkan token JWT dengan format: Bearer <token>",
//         },
//       },
//     },
//   },
//   apis: ["./routes/*.js", "./controllers/*.js"],
// };

// const swaggerDocs = swaggerJsdoc(swaggerOptions);
// const swaggerUiOptions = {
//   customSiteTitle: "Bimbel Pilar API Docs",
// };
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bimbel Pilar Backend API is running!"
  });
});

//sini routesnyaa 
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/kelas", kelasRoutes)
app.use("/api/spp", sppRoutes)

//handling endpoint
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Endpoint tidak ditemukan." 
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});