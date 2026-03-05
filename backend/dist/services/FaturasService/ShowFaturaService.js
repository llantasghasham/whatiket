"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Fatura_1 = __importDefault(require("../../models/Fatura"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFaturaService = async (id, companyId) => {
    const fatura = await Fatura_1.default.findOne({ where: { id, companyId } });
    if (!fatura) {
        throw new AppError_1.default("ERR_NO_FATURA_FOUND", 404);
    }
    return fatura;
};
exports.default = ShowFaturaService;
