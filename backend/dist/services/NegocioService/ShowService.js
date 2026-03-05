"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Negocio_1 = __importDefault(require("../../models/Negocio"));
const ShowService = async (id, companyId) => {
    const negocio = await Negocio_1.default.findOne({
        where: { id, companyId }
    });
    if (!negocio) {
        throw new AppError_1.default("ERR_NEGOCIO_NOT_FOUND", 404);
    }
    return negocio;
};
exports.default = ShowService;
