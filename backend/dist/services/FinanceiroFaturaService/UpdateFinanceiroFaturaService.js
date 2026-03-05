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
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const PaymentGatewayService_1 = require("../PaymentGatewayService");
const generateCheckoutToken_1 = __importDefault(require("./helpers/generateCheckoutToken"));
const schema = Yup.object().shape({
    descricao: Yup.string().max(255),
    valor: Yup.number().positive(),
    status: Yup.string().oneOf(["aberta", "paga", "vencida", "cancelada"]),
    dataVencimento: Yup.date(),
    dataPagamento: Yup.date().nullable(),
    tipoReferencia: Yup.string().oneOf(["servico", "produto"]).nullable(),
    referenciaId: Yup.number().nullable(),
    tipoRecorrencia: Yup.string().oneOf(["unica", "mensal", "anual"]),
    quantidadeCiclos: Yup.number().integer().positive().nullable(),
    cicloAtual: Yup.number().integer().min(1),
    dataInicio: Yup.date(),
    dataFim: Yup.date().nullable(),
    ativa: Yup.boolean(),
    observacoes: Yup.string().nullable(),
    paymentProvider: Yup.mixed()
        .oneOf(["asaas", "mercadopago"])
        .nullable()
});
const UpdateFinanceiroFaturaService = async ({ id, companyId, ...fields }) => {
    const record = await FinanceiroFatura_1.default.findOne({
        where: { id, companyId }
    });
    if (!record) {
        throw new AppError_1.default("Fatura não encontrada.", 404);
    }
    const data = await schema.validate(fields, { abortEarly: false });
    const previousSnapshot = record.get({ plain: true });
    const { paymentProvider, ...updatableFields } = data;
    if ((typeof data.tipoReferencia !== "undefined" ||
        typeof data.referenciaId !== "undefined") &&
        ((data.tipoReferencia && !data.referenciaId) ||
            (!data.tipoReferencia && data.referenciaId))) {
        throw new AppError_1.default("Para vincular uma referência é necessário informar tipo_referencia e referencia_id.", 400);
    }
    if (data.tipoRecorrencia === "unica" &&
        (typeof data.quantidadeCiclos !== "undefined" ||
            typeof data.dataFim !== "undefined")) {
        throw new AppError_1.default("Faturas com recorrência 'unica' não devem possuir quantidade_ciclos ou data_fim.", 400);
    }
    if (Object.keys(updatableFields).length > 0) {
        await record.update(updatableFields);
    }
    if (typeof paymentProvider !== "undefined") {
        const providerChanged = record.paymentProvider &&
            record.paymentExternalId &&
            (paymentProvider !== record.paymentProvider || !paymentProvider);
        if (providerChanged) {
            await (0, PaymentGatewayService_1.cancelGatewayPayment)(record);
        }
        if (paymentProvider) {
            let checkoutToken = record.checkoutToken;
            if (!checkoutToken) {
                checkoutToken = await (0, generateCheckoutToken_1.default)();
            }
            const paymentData = await (0, PaymentGatewayService_1.generatePaymentLink)({
                invoice: record,
                provider: paymentProvider
            });
            await record.update({
                paymentProvider,
                paymentLink: paymentData.paymentLink,
                paymentExternalId: paymentData.paymentExternalId,
                checkoutToken
            });
        }
        else {
            await record.update({
                paymentProvider: null,
                paymentLink: null,
                paymentExternalId: null,
                checkoutToken: null
            });
        }
    }
    await record.reload();
    const statusChanged = typeof data.status !== "undefined" && data.status !== previousSnapshot.status;
    const baseFieldsChanged = typeof data.valor !== "undefined" ||
        typeof data.descricao !== "undefined" ||
        typeof data.dataVencimento !== "undefined";
    const canSyncAsaas = record.paymentProvider === "asaas" && Boolean(record.paymentExternalId);
    if (baseFieldsChanged) {
        if (canSyncAsaas) {
            const payload = {};
            if (typeof data.valor !== "undefined") {
                payload.value = Number(record.valor);
            }
            if (typeof data.descricao !== "undefined") {
                payload.description = record.descricao;
            }
            if (typeof data.dataVencimento !== "undefined") {
                payload.dueDate = record.dataVencimento
                    ? new Date(record.dataVencimento).toISOString().substring(0, 10)
                    : undefined;
            }
            if (Object.keys(payload).length > 0) {
                await (0, PaymentGatewayService_1.updateAsaasPayment)(record, payload);
            }
        }
        else if (record.paymentProvider === "mercadopago") {
            await (0, PaymentGatewayService_1.cancelGatewayPayment)(record);
            const paymentData = await (0, PaymentGatewayService_1.generatePaymentLink)({
                invoice: record,
                provider: "mercadopago"
            });
            await record.update({
                paymentLink: paymentData.paymentLink,
                paymentExternalId: paymentData.paymentExternalId
            });
        }
    }
    if (statusChanged) {
        if (record.status === "paga") {
            if (record.paymentProvider === "asaas") {
                const value = Number(record.valorPago || record.valor || 0);
                await (0, PaymentGatewayService_1.receiveAsaasPayment)(record, {
                    value,
                    paymentDate: record.dataPagamento
                });
            }
        }
        else if (record.status === "cancelada") {
            await (0, PaymentGatewayService_1.cancelGatewayPayment)(record);
        }
    }
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
        action: "fatura:updated",
        payload: record
    });
    return record;
};
exports.default = UpdateFinanceiroFaturaService;
