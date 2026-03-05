"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GoogleSheetsController_1 = require("../controllers/GoogleSheetsController");
const router = (0, express_1.Router)();
// Autenticação
router.post("/auth", GoogleSheetsController_1.authenticate);
router.get("/auth/callback", GoogleSheetsController_1.authCallback);
router.get("/auth-status", GoogleSheetsController_1.getAuthStatus);
// Teste e operações
router.post("/test", GoogleSheetsController_1.testConnection);
router.post("/execute", GoogleSheetsController_1.executeOperation);
exports.default = router;
