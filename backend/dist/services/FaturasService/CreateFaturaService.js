"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Fatura_1 = __importDefault(require("../../models/Fatura"));
const CreateFaturaService = async (data) => {
    const fatura = await Fatura_1.default.create({
        ...data,
        status: data.status || "pendente"
    });
    return fatura;
};
exports.default = CreateFaturaService;
