"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const AppError_1 = __importDefault(require("../errors/AppError"));
const auth_1 = __importDefault(require("../config/auth"));
const updateUser_1 = require("../helpers/updateUser");
const isAuth = async (req, res, next) => {
    console.log("HIT isAuth | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("ERR_SESSION_EXPIRED THROWN FROM isAuth.ts LINE", 26);
        throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
    }
    // const check = await verifyHelper();
    // if (!check) {
    //   throw new AppError("ERR_SYSTEM_INVALID", 401);
    // }
    const [, token] = authHeader.split(" ");
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
        const { id, profile, companyId } = decoded;
        (0, updateUser_1.updateUser)(id, companyId);
        req.user = {
            id,
            profile,
            companyId
        };
    }
    catch (err) {
        // Log do erro para debug
        console.error("Auth error:", err.name, err.message);
        if (err.name === "TokenExpiredError") {
            // Token expirado, tentar renovar
            try {
                const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret, { ignoreExpiration: true });
                const { id, profile, companyId } = decoded;
                // Gerar novo token
                const newToken = (0, jsonwebtoken_1.sign)({ id, profile, companyId }, auth_1.default.secret, {
                    expiresIn: auth_1.default.expiresIn
                });
                // Adicionar novo token no header da resposta
                res.setHeader('x-new-token', newToken);
                (0, updateUser_1.updateUser)(id, companyId);
                req.user = {
                    id,
                    profile,
                    companyId
                };
                console.log("Token renovado automaticamente");
            }
            catch (renewError) {
                console.error("Erro ao renovar token:", renewError);
                console.log("ERR_SESSION_EXPIRED THROWN FROM isAuth.ts LINE", 78, "(renewError)");
                throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
            }
        }
        else if (err.name === "JsonWebTokenError") {
            throw new AppError_1.default("ERR_INVALID_TOKEN", 401);
        }
        else {
            throw new AppError_1.default("Invalid token. We'll try to assign a new one on next request", 403);
        }
    }
    return next();
};
exports.default = isAuth;
