"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MobileWebhookController = __importStar(require("../controllers/MobileWebhookController"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const mobileWebhookRoutes = (0, express_1.Router)();
// Rota para registrar webhook de notificação mobile
mobileWebhookRoutes.post("/register", isAuth_1.default, MobileWebhookController.registerWebhook);
// Rota para remover webhook de notificação mobile
mobileWebhookRoutes.delete("/unregister", isAuth_1.default, MobileWebhookController.unregisterWebhook);
// Rota para listar webhooks registrados
mobileWebhookRoutes.get("/list", isAuth_1.default, MobileWebhookController.listWebhooks);
// Rota para testar webhook
mobileWebhookRoutes.post("/test", isAuth_1.default, MobileWebhookController.testWebhook);
exports.default = mobileWebhookRoutes;
