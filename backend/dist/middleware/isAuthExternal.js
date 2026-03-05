"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const CompanyApiKey_1 = __importDefault(require("../models/CompanyApiKey"));
const isAuthExternal = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    const [, token] = authHeader.split(" ");
    if (!token) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    const apiKey = await CompanyApiKey_1.default.findOne({
        where: { token, active: true }
    });
    if (!apiKey) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_INVALID", 401);
    }
    req.externalAuth = {
        companyId: apiKey.companyId,
        apiKeyId: apiKey.id,
        webhookUrl: apiKey.webhookUrl,
        webhookSecret: apiKey.webhookSecret,
        token: apiKey.token
    };
    apiKey.lastUsedAt = new Date();
    await apiKey.save();
    return next();
};
exports.default = isAuthExternal;
