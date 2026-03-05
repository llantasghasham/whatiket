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
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const syncFaturaPagamentoStatus_1 = __importDefault(require("./helpers/syncFaturaPagamentoStatus"));
const socket_1 = require("../../libs/socket");
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    faturaId: Yup.number().required(),
    metodoPagamento: Yup.string()
        .required()
        .oneOf(["pix", "cartao", "boleto", "transferencia", "dinheiro", "manual"]),
    valor: Yup.number().required().moreThan(0),
    dataPagamento: Yup.date().nullable(),
    observacoes: Yup.string().nullable()
});
const CreateFinanceiroPagamentoService = async (data) => {
    const payload = await schema.validate(data, { abortEarly: false });
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: payload.faturaId, companyId: payload.companyId }
    });
    if (!fatura) {
        throw new AppError_1.default("Fatura não encontrada para esta empresa.", 404);
    }
    const pagamento = await FinanceiroPagamento_1.default.create({
        ...payload,
        dataPagamento: payload.dataPagamento || new Date()
    }, { transaction: payload.transaction });
    await (0, syncFaturaPagamentoStatus_1.default)({
        companyId: payload.companyId,
        faturaId: payload.faturaId,
        transaction: payload.transaction
    });
    await fatura.reload();
    const io = (0, socket_1.getIO)();
    io.of(String(payload.companyId)).emit(`company-${payload.companyId}-financeiro`, {
        action: "pagamento:created",
        payload: {
            pagamento,
            fatura
        }
    });
    return pagamento;
};
exports.default = CreateFinanceiroPagamentoService;
