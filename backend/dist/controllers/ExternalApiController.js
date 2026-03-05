"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.logout = exports.refresh = exports.login = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const ExternalAuthService_1 = __importDefault(require("../services/AuthServices/ExternalAuthService"));
const RefreshTokenService_1 = require("../services/AuthServices/RefreshTokenService");
const User_1 = __importDefault(require("../models/User"));
/**
 * API Externa de Login
 * POST /api/external/login
 * Body: { email: string, password: string }
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError_1.default("ERR_MISSING_CREDENTIALS", 400);
    }
    const { user, token, refreshToken, expiresIn } = await (0, ExternalAuthService_1.default)({
        email,
        password
    });
    return res.status(200).json({
        success: true,
        data: {
            user,
            token,
            refreshToken,
            expiresIn
        }
    });
};
exports.login = login;
/**
 * API Externa de Refresh Token
 * POST /api/external/refresh
 * Body: { refreshToken: string }
 */
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError_1.default("ERR_MISSING_REFRESH_TOKEN", 400);
    }
    try {
        const { user, newToken, refreshToken: newRefreshToken } = await (0, RefreshTokenService_1.RefreshTokenService)(res, refreshToken);
        return res.status(200).json({
            success: true,
            data: {
                user,
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: 900
            }
        });
    }
    catch (error) {
        throw new AppError_1.default("ERR_INVALID_REFRESH_TOKEN", 401);
    }
};
exports.refresh = refresh;
/**
 * API Externa de Logout
 * POST /api/external/logout
 * Headers: Authorization: Bearer <token>
 */
const logout = async (req, res) => {
    const { id } = req.user;
    if (id) {
        const user = await User_1.default.findByPk(id);
        if (user) {
            await user.update({ online: false });
        }
    }
    return res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso"
    });
};
exports.logout = logout;
/**
 * API Externa de Verificação de Token
 * GET /api/external/verify
 * Headers: Authorization: Bearer <token>
 */
const verify = async (req, res) => {
    const { id, profile, companyId } = req.user;
    const user = await User_1.default.findByPk(id, {
        attributes: ["id", "name", "email", "profile", "companyId", "online"]
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    return res.status(200).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            companyId: user.companyId,
            online: user.online
        }
    });
};
exports.verify = verify;
