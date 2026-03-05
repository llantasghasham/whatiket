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
const ExternalContactController = __importStar(require("../../controllers/api/ExternalContactController"));
const externalContactRoutes = (0, express_1.Router)();
externalContactRoutes.get("/contacts", isAuthExternal_1.default, ExternalContactController.index);
externalContactRoutes.get("/contacts/:id", isAuthExternal_1.default, ExternalContactController.show);
externalContactRoutes.post("/contacts", isAuthExternal_1.default, ExternalContactController.store);
externalContactRoutes.put("/contacts/:id", isAuthExternal_1.default, ExternalContactController.update);
externalContactRoutes.delete("/contacts/:id", isAuthExternal_1.default, ExternalContactController.remove);
exports.default = externalContactRoutes;
