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
const ExternalQueueController = __importStar(require("../../controllers/api/ExternalQueueController"));
const externalQueueRoutes = (0, express_1.Router)();
externalQueueRoutes.get("/queues", isAuthExternal_1.default, ExternalQueueController.index);
externalQueueRoutes.get("/queues/:id", isAuthExternal_1.default, ExternalQueueController.show);
externalQueueRoutes.post("/queues", isAuthExternal_1.default, ExternalQueueController.store);
externalQueueRoutes.put("/queues/:id", isAuthExternal_1.default, ExternalQueueController.update);
externalQueueRoutes.delete("/queues/:id", isAuthExternal_1.default, ExternalQueueController.remove);
exports.default = externalQueueRoutes;
