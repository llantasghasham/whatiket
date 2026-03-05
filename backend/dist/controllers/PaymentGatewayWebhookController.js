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
exports.asaasWebhook = exports.mercadoPagoWebhook = void 0;
const Sentry = __importStar(require("@sentry/node"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const HandlePaymentGatewayUpdateService_1 = __importDefault(require("../services/FinanceiroFaturaService/HandlePaymentGatewayUpdateService"));
const PaymentGatewayService_1 = require("../services/PaymentGatewayService");
const FinanceiroFatura_1 = __importDefault(require("../models/FinanceiroFatura"));
const mercadopago = require("mercadopago");
const safeNumber = (value) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return undefined;
};
const findInvoiceCompany = async (invoiceId) => {
    if (!invoiceId) {
        return undefined;
    }
    const record = await FinanceiroFatura_1.default.findByPk(invoiceId);
    return record?.companyId;
};
const mercadoPagoWebhook = async (req, res) => {
    const paymentId = req.body?.data?.id || req.body?.id;
    if (!paymentId) {
        return res.status(200).json({ ignored: true });
    }
    try {
        const invoiceIdParam = safeNumber(req.query.invoiceId);
        let companyId = safeNumber(req.query.companyId);
        if (!companyId && invoiceIdParam) {
            companyId = await findInvoiceCompany(invoiceIdParam);
        }
        if (!companyId) {
            throw new AppError_1.default("companyId não informado no webhook.", 400);
        }
        const tokenRecord = await (0, PaymentGatewayService_1.getCompanyPaymentToken)(companyId, "mercadopago");
        mercadopago.configure({
            access_token: tokenRecord.token
        });
        const payment = await mercadopago.payment.get(paymentId);
        const paymentBody = payment?.body;
        await (0, HandlePaymentGatewayUpdateService_1.default)({
            provider: "mercadopago",
            invoiceId: invoiceIdParam || paymentBody?.external_reference,
            paymentExternalId: paymentBody?.id,
            status: paymentBody?.status,
            paidAmount: paymentBody?.transaction_amount,
            paymentDate: paymentBody?.date_approved
        });
        return res.status(200).json({ ok: true });
    }
    catch (error) {
        Sentry.captureException(error);
        console.error("MercadoPago webhook error:", error);
        return res.status(200).json({ ok: false });
    }
};
exports.mercadoPagoWebhook = mercadoPagoWebhook;
const asaasWebhook = async (req, res) => {
    const payload = req.body;
    const payment = payload?.payment || payload?.data?.payment || payload;
    if (!payment) {
        return res.status(200).json({ ignored: true });
    }
    try {
        await (0, HandlePaymentGatewayUpdateService_1.default)({
            provider: "asaas",
            invoiceId: payment.externalReference,
            paymentExternalId: payment.id,
            status: payment.status || payload?.event,
            paidAmount: payment.value,
            paymentDate: payment.receivedDate ||
                payment.confirmedDate ||
                payment.paymentDate ||
                payment.dateCreated
        });
        return res.status(200).json({ ok: true });
    }
    catch (error) {
        Sentry.captureException(error);
        console.error("Asaas webhook error:", error);
        return res.status(200).json({ ok: false });
    }
};
exports.asaasWebhook = asaasWebhook;
