"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ShowFinanceiroFaturaService = async (id, companyId) => {
    const record = await FinanceiroFatura_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone", "status"]
            }
        ]
    });
    if (!record) {
        throw new AppError_1.default("Fatura não encontrada.", 404);
    }
    return record;
};
exports.default = ShowFinanceiroFaturaService;
