"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const isAuthCompany = async (req, res, next) => {
    console.log("HIT isAuthCompany | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("ERR_SESSION_EXPIRED THROWN FROM isAuthCompany.ts LINE", 15);
        throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
    }
    const [, token] = authHeader.split(" ");
    try {
        const getToken = process.env.COMPANY_TOKEN;
        if (!getToken) {
            throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
        }
        if (getToken !== token) {
            throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
        }
    }
    catch (err) {
        throw new AppError_1.default("Invalid token. We'll try to assign a new one on next request", 403);
    }
    return next();
};
exports.default = isAuthCompany;
