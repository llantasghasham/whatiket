"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speakeasy_1 = __importDefault(require("speakeasy"));
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateTokens_1 = require("../../helpers/CreateTokens");
const SerializeUser_1 = require("../../helpers/SerializeUser");
const Company_1 = __importDefault(require("../../models/Company"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Verify2FAService = async ({ email, token }) => {
    const user = await User_1.default.findOne({
        where: { email },
        include: ["queues", { model: Company_1.default, include: [{ model: CompaniesSettings_1.default }] }]
    });
    if (!user) {
        throw new AppError_1.default("ERR_INVALID_CREDENTIALS", 401);
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError_1.default("ERR_2FA_NOT_ENABLED", 400);
    }
    const verified = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1
    });
    if (!verified) {
        throw new AppError_1.default("ERR_2FA_INVALID_TOKEN", 401);
    }
    const accessToken = (0, CreateTokens_1.createAccessToken)(user);
    const refreshToken = (0, CreateTokens_1.createRefreshToken)(user);
    const serializedUser = await (0, SerializeUser_1.SerializeUser)(user);
    return {
        serializedUser,
        token: accessToken,
        refreshToken
    };
};
exports.default = Verify2FAService;
