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
const isAuthExternal_1 = __importDefault(require("../../middleware/isAuthExternal"));
const ExternalWhatsappController = __importStar(require("../../controllers/api/ExternalWhatsappController"));
const externalWhatsappRoutes = (0, express_1.Router)();
externalWhatsappRoutes.get("/whatsapps", isAuthExternal_1.default, ExternalWhatsappController.index);
externalWhatsappRoutes.get("/whatsapps/:id", isAuthExternal_1.default, ExternalWhatsappController.show);
externalWhatsappRoutes.get("/whatsapps/:id/status", isAuthExternal_1.default, ExternalWhatsappController.status);
externalWhatsappRoutes.get("/whatsapps/:id/qrcode", isAuthExternal_1.default, ExternalWhatsappController.qrcode);
externalWhatsappRoutes.post("/whatsapps", isAuthExternal_1.default, ExternalWhatsappController.store);
externalWhatsappRoutes.put("/whatsapps/:id", isAuthExternal_1.default, ExternalWhatsappController.update);
externalWhatsappRoutes.delete("/whatsapps/:id", isAuthExternal_1.default, ExternalWhatsappController.remove);
externalWhatsappRoutes.post("/whatsapps/:id/restart", isAuthExternal_1.default, ExternalWhatsappController.restart);
externalWhatsappRoutes.post("/whatsapps/:id/disconnect", isAuthExternal_1.default, ExternalWhatsappController.disconnect);
exports.default = externalWhatsappRoutes;
