"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const syncFaturaPagamentoStatus_1 = __importDefault(require("./helpers/syncFaturaPagamentoStatus"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const socket_1 = require("../../libs/socket");
const schema = Yup.object().shape({
    metodoPagamento: Yup.string().oneOf([
        "pix",
        "cartao",
        "boleto",
        "transferencia",
        "dinheiro",
        "manual"
    ]),
    valor: Yup.number().moreThan(0),
    dataPagamento: Yup.date(),
    observacoes: Yup.string().nullable()
});
const UpdateFinanceiroPagamentoService = async ({ id, companyId, ...fields }) => {
    const pagamento = await FinanceiroPagamento_1.default.findOne({
        where: { id, companyId }
    });
    if (!pagamento) {
        throw new AppError_1.default("Pagamento não encontrado.", 404);
    }
    const data = await schema.validate(fields, { abortEarly: false });
    await pagamento.update(data);
    await (0, syncFaturaPagamentoStatus_1.default)({
        companyId,
        faturaId: pagamento.faturaId
    });
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: pagamento.faturaId, companyId }
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
        action: "pagamento:updated",
        payload: {
            pagamento,
            fatura
        }
    });
    return pagamento;
};
exports.default = UpdateFinanceiroPagamentoService;
