"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController"); // must match named export
const router = (0, express_1.Router)();
router.post("/login", authController_1.login);
exports.default = router;
