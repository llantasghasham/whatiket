"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileWebViewAuth = exports.mobileLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const User_1 = __importDefault(require("../models/User"));
const socket_1 = require("../libs/socket");
const mobileLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new AppError_1.default("ERR_TOKEN_REQUIRED", 401);
        }
        // Verificar e decodificar o token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        // Buscar usuário pelo ID do token
        const user = await User_1.default.findByPk(decoded.id);
        if (!user) {
            throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
        }
        // Atualizar status online
        await user.update({ online: true });
        // Emitir evento para WebSocket
        const io = (0, socket_1.getIO)();
        io.of(user.companyId.toString()).emit(`company-${user.companyId}-auth`, {
            action: "update",
            user: {
                id: user.id,
                email: user.email,
                companyId: user.companyId,
                online: true
            }
        });
        // Retornar dados do usuário para uso na WebView
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
                companyId: user.companyId,
                online: true,
                userType: user.userType,
                whatsappId: user.whatsappId
            }
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new AppError_1.default("ERR_INVALID_TOKEN", 401);
        }
        throw error;
    }
};
exports.mobileLogin = mobileLogin;
const mobileWebViewAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new AppError_1.default("ERR_TOKEN_REQUIRED", 401);
        }
        // Verificar e decodificar o token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        // Buscar usuário pelo ID do token
        const user = await User_1.default.findByPk(decoded.id);
        if (!user) {
            throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
        }
        // Atualizar status online
        await user.update({ online: true });
        // Emitir evento para WebSocket
        const io = (0, socket_1.getIO)();
        io.of(user.companyId.toString()).emit(`company-${user.companyId}-auth`, {
            action: "update",
            user: {
                id: user.id,
                email: user.email,
                companyId: user.companyId,
                online: true
            }
        });
        // Retornar sucesso para WebView
        return res.status(200).json({
            success: true,
            message: "WebView authenticated successfully"
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new AppError_1.default("ERR_INVALID_TOKEN", 401);
        }
        throw error;
    }
};
exports.mobileWebViewAuth = mobileWebViewAuth;
