"use strict";

require("dotenv").config();
const crypto = require("crypto");

class TokenService {
  constructor() {
    const secretKey = process.env.TOKEN_ENCRYPTION_KEY;
    
    if (!secretKey) {
      throw new Error("TOKEN_ENCRYPTION_KEY is missing in .env file");
    }

    this.secretKey = secretKey;
  }

  generateRandomToken(length = 3) {
    // 3 bytes dalam format hex akan menghasilkan 6 karakter (misal: "a1b2c3")
    // Lalu kita ubah menjadi huruf kapital semua (.toUpperCase())
    return crypto.randomBytes(length).toString("hex").toUpperCase();
  }

  // Menggunakan HMAC-SHA-256 untuk menghasilkan hash terautentikasi
  encrypt(token) {
    const hmac = crypto.createHmac("sha256", this.secretKey);
    hmac.update(token);
    return hmac.digest("hex");
  }
}

module.exports = new TokenService();