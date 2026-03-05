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
const ExternalFaturaController = __importStar(require("../../controllers/api/ExternalFaturaController"));
const externalFaturaRoutes = (0, express_1.Router)();
externalFaturaRoutes.get("/faturas", isAuthExternal_1.default, ExternalFaturaController.index);
externalFaturaRoutes.get("/faturas/:id", isAuthExternal_1.default, ExternalFaturaController.show);
externalFaturaRoutes.post("/faturas", isAuthExternal_1.default, ExternalFaturaController.store);
externalFaturaRoutes.put("/faturas/:id", isAuthExternal_1.default, ExternalFaturaController.update);
externalFaturaRoutes.delete("/faturas/:id", isAuthExternal_1.default, ExternalFaturaController.remove);
externalFaturaRoutes.post("/faturas/:id/pay", isAuthExternal_1.default, ExternalFaturaController.markAsPaid);
externalFaturaRoutes.post("/faturas/:id/cancel", isAuthExternal_1.default, ExternalFaturaController.cancel);
externalFaturaRoutes.get("/faturas/project/:projectId", isAuthExternal_1.default, ExternalFaturaController.listByProject);
externalFaturaRoutes.get("/faturas/client/:clientId", isAuthExternal_1.default, ExternalFaturaController.listByClient);
exports.default = externalFaturaRoutes;
