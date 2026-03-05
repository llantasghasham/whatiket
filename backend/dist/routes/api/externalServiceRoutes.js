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
const ExternalServiceController = __importStar(require("../../controllers/api/ExternalServiceController"));
const externalServiceRoutes = (0, express_1.Router)();
externalServiceRoutes.get("/services", isAuthExternal_1.default, ExternalServiceController.index);
externalServiceRoutes.get("/services/:id", isAuthExternal_1.default, ExternalServiceController.show);
externalServiceRoutes.post("/services", isAuthExternal_1.default, ExternalServiceController.store);
externalServiceRoutes.put("/services/:id", isAuthExternal_1.default, ExternalServiceController.update);
externalServiceRoutes.delete("/services/:id", isAuthExternal_1.default, ExternalServiceController.remove);
exports.default = externalServiceRoutes;
