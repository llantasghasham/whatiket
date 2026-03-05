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
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const PaymentGatewayService_1 = require("../PaymentGatewayService");
const generateCheckoutToken_1 = __importDefault(require("./helpers/generateCheckoutToken"));
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    clientId: Yup.number().required(),
    descricao: Yup.string().required().max(255),
    valor: Yup.number().required().moreThan(0),
    status: Yup.string()
        .oneOf(["aberta", "paga", "vencida", "cancelada"])
        .default("aberta"),
    dataVencimento: Yup.date().required(),
    dataPagamento: Yup.date().nullable(),
    tipoReferencia: Yup.string().oneOf(["servico", "produto"]).nullable(),
    referenciaId: Yup.number().nullable(),
    tipoRecorrencia: Yup.string()
        .oneOf(["unica", "mensal", "anual"])
        .default("unica"),
    quantidadeCiclos: Yup.number().integer().positive().nullable(),
    cicloAtual: Yup.number().integer().min(1).default(1),
    dataInicio: Yup.date().nullable(),
    dataFim: Yup.date().nullable(),
    ativa: Yup.boolean().default(true),
    observacoes: Yup.string().nullable(),
    paymentProvider: Yup.mixed()
        .oneOf(["asaas", "mercadopago"])
        .nullable(),
    projectId: Yup.number().nullable()
});
const CreateFinanceiroFaturaService = async (data) => {
    const payload = await schema.validate(data, { abortEarly: false });
    if ((payload.tipoReferencia && !payload.referenciaId) ||
        (!payload.tipoReferencia && payload.referenciaId)) {
        throw new AppError_1.default("Para vincular uma referência é necessário informar tipo_referencia e referencia_id.", 400);
    }
    if (payload.tipoRecorrencia === "unica" &&
        (payload.quantidadeCiclos || payload.dataFim)) {
        throw new AppError_1.default("Faturas com recorrência 'unica' não devem possuir quantidade_ciclos ou data_fim.", 400);
    }
    const client = await CrmClient_1.default.findOne({
        where: { id: payload.clientId, companyId: payload.companyId }
    });
    if (!client) {
        throw new AppError_1.default("Cliente não encontrado para esta empresa.", 404);
    }
    let record = await FinanceiroFatura_1.default.create({
        ...payload,
        status: payload.status || "aberta",
        tipoRecorrencia: payload.tipoRecorrencia || "unica",
        cicloAtual: payload.cicloAtual || 1,
        ativa: payload.ativa ?? true,
        dataInicio: payload.dataInicio || new Date()
    }, { transaction: payload.transaction });
    if (payload.paymentProvider) {
        try {
            let checkoutToken = record.checkoutToken;
            if (!checkoutToken) {
                checkoutToken = await (0, generateCheckoutToken_1.default)();
            }
            const paymentData = await (0, PaymentGatewayService_1.generatePaymentLink)({
                invoice: record,
                provider: payload.paymentProvider
            });
            record = await record.update({
                paymentProvider: payload.paymentProvider,
                paymentLink: paymentData.paymentLink,
                paymentExternalId: paymentData.paymentExternalId,
                checkoutToken
            });
        }
        catch (error) {
            console.error("Erro ao gerar link de pagamento:", error);
        }
    }
    const io = (0, socket_1.getIO)();
    io.of(String(payload.companyId)).emit(`company-${payload.companyId}-financeiro`, {
        action: "fatura:created",
        payload: record
    });
    return record;
};
exports.default = CreateFinanceiroFaturaService;
