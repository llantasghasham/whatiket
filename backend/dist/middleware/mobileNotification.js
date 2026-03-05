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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterMobileDevice = exports.registerMobileDevice = void 0;
const NotificationController = __importStar(require("../controllers/NotificationController"));
// Middleware para registrar dispositivo móvel
const registerMobileDevice = async (req, res) => {
    try {
        const { deviceToken, platform } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        if (!deviceToken || !platform) {
            return res.status(400).json({ error: "Device token and platform are required" });
        }
        await NotificationController.registerDevice(req, res);
    }
    catch (error) {
        console.error("Error registering mobile device:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.registerMobileDevice = registerMobileDevice;
// Middleware para remover dispositivo móvel
const unregisterMobileDevice = async (req, res) => {
    try {
        const { deviceToken } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        await NotificationController.unregisterDevice(req, res);
    }
    catch (error) {
        console.error("Error unregistering mobile device:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.unregisterMobileDevice = unregisterMobileDevice;
