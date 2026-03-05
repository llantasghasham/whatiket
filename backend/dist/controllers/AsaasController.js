"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secondCopyByCpf = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const PaymentGatewayService_1 = require("../services/PaymentGatewayService");
const secondCopyByCpf = async (req, res) => {
    const { companyId } = req.user;
    const cpf = (req.body?.cpf || req.query?.cpf || "").toString();
    if (!companyId) {
        throw new AppError_1.default("Empresa não identificada.", 400);
    }
    if (!cpf) {
        throw new AppError_1.default("Informe o CPF do cliente.", 400);
    }
    const data = await (0, PaymentGatewayService_1.getAsaasSecondCopyByCpf)(companyId, cpf);
    return res.json({
        message: "Segunda via obtida com sucesso.",
        data
    });
};
exports.secondCopyByCpf = secondCopyByCpf;
exports.default = { secondCopyByCpf: exports.secondCopyByCpf };
