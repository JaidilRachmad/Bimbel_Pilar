"use strict";

class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = "Akses ditolak, autentikasi diperlukan") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Akses tidak diizinkan") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource tidak ditemukan") {
    return new AppError(message, 404);
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500);
  }
}

module.exports = AppError;