"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelGatewayPayment = exports.cancelMercadoPagoPreference = exports.cancelAsaasPayment = exports.receiveAsaasPayment = exports.updateAsaasPayment = exports.generatePaymentLink = exports.getAsaasSecondCopyByCpf = exports.getCompanyPaymentToken = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const CompanyPaymentSetting_1 = __importDefault(require("../../models/CompanyPaymentSetting"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const syncAsaasCustomer_1 = __importDefault(require("./helpers/syncAsaasCustomer"));
const mercadopago = require("mercadopago");
const ASAAS_BASE_URL = "https://api.asaas.com/v3";
const getCompanyPaymentToken = async (companyId, provider) => {
    const setting = await CompanyPaymentSetting_1.default.findOne({
        where: { companyId, provider, active: true }
    });
    if (!setting) {
        throw new AppError_1.default(`Token para ${provider} não configurado.`, 400);
    }
    return setting;
};
exports.getCompanyPaymentToken = getCompanyPaymentToken;
const generateMercadoPagoLink = async (invoice, token) => {
    mercadopago.configure({
        access_token: token
    });
    const baseNotificationUrl = process.env.MP_NOTIFICATION_URL;
    const notificationUrl = baseNotificationUrl && invoice.companyId
        ? `${baseNotificationUrl}?companyId=${invoice.companyId}&invoiceId=${invoice.id}`
        : baseNotificationUrl;
    const preference = {
        external_reference: String(invoice.id),
        notification_url: notificationUrl,
        items: [
            {
                title: invoice.descricao || `Fatura #${invoice.id}`,
                unit_price: Number(invoice.valor),
                quantity: 1
            }
        ]
    };
    const response = await mercadopago.preferences.create(preference);
    return {
        paymentLink: response.body.init_point,
        paymentExternalId: response.body.id || null
    };
};
const sanitizePayload = (payload) => {
    const sanitized = { ...payload };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === undefined ||
            sanitized[key] === null ||
            sanitized[key] === "") {
            delete sanitized[key];
        }
    });
    return sanitized;
};
const extractAsaasErrorMessage = (error) => {
    const responseData = error?.response?.data;
    if (responseData?.errors?.length) {
        return responseData.errors
            .map((err) => err?.description || err?.message || err?.code)
            .filter(Boolean)
            .join("; ");
    }
    return (responseData?.message ||
        responseData?.error ||
        error?.message ||
        "Erro desconhecido na Asaas");
};
const generateAsaasPayment = async (invoice, token, customerId) => {
    const payload = sanitizePayload({
        customer: customerId,
        name: invoice.descricao || `Fatura #${invoice.id}`,
        description: invoice.descricao || `Fatura #${invoice.id}`,
        value: Number(invoice.valor),
        billingType: "UNDEFINED",
        dueDate: invoice.dataVencimento
            ? new Date(invoice.dataVencimento).toISOString().substring(0, 10)
            : undefined,
        notificationEnabled: true,
        externalReference: String(invoice.id)
    });
    try {
        const response = await axios_1.default.post("https://api.asaas.com/v3/payments", payload, {
            headers: {
                "Content-Type": "application/json",
                access_token: token
            }
        });
        const paymentLink = response.data?.invoiceUrl ||
            response.data?.bankSlipUrl ||
            response.data?.invoicePdf ||
            response.data?.checkoutUrl;
        return {
            paymentLink: paymentLink || response.data?.url,
            paymentExternalId: response.data?.id || (0, uuid_1.v4)()
        };
    }
    catch (error) {
        const status = error?.response?.status || 500;
        const message = extractAsaasErrorMessage(error);
        throw new AppError_1.default(`[Asaas] ${message}`, status);
    }
};
const getAsaasSecondCopyByCpf = async (companyId, cpf) => {
    const sanitizedCpf = normalizeDocument(cpf);
    if (!sanitizedCpf || sanitizedCpf.length < 11) {
        throw new AppError_1.default("CPF inválido.", 400);
    }
    const { headers } = await getAsaasHeaders(companyId);
    const customerParams = new URLSearchParams({
        cpfCnpj: sanitizedCpf,
        limit: "1",
        offset: "0"
    });
    const customerResponse = await axios_1.default.get(`${ASAAS_BASE_URL}/customers?${customerParams.toString()}`, { headers });
    const customer = customerResponse.data?.data?.[0];
    if (!customer?.id) {
        throw new AppError_1.default("CPF não encontrado ou não cadastrado no Asaas.", 404);
    }
    const queryParams = new URLSearchParams({
        customer: customer.id,
        limit: "10",
        offset: "0",
        sort: "dueDate",
        order: "desc"
    });
    const listResponse = await axios_1.default.get(`${ASAAS_BASE_URL}/payments?${queryParams.toString()}`, { headers });
    const payments = listResponse.data?.data || [];
    const allowedStatuses = ["PENDING", "OVERDUE", "DUNNING_REQUESTED", "DUNNING_RECEIVED"];
    const payment = payments.find(item => allowedStatuses.includes(item?.status)) ||
        payments[0];
    if (!payment) {
        throw new AppError_1.default("Nenhum boleto pendente encontrado para este CPF.", 404);
    }
    const paymentId = payment.id;
    const [identificationFieldResponse, pixResponse] = await Promise.all([
        axios_1.default
            .get(`${ASAAS_BASE_URL}/payments/${paymentId}/identificationField`, {
            headers
        })
            .catch(error => {
            if (error?.response?.status === 404) {
                return { data: null };
            }
            throw error;
        }),
        axios_1.default
            .get(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
            headers
        })
            .catch(error => {
            if (error?.response?.status === 404) {
                return { data: null };
            }
            throw error;
        })
    ]);
    const identificationData = identificationFieldResponse?.data || {};
    const pixData = pixResponse?.data || null;
    return {
        paymentId,
        customerName: payment?.customerName,
        customerCpfCnpj: payment?.customerCpfCnpj,
        dueDate: payment?.dueDate,
        value: payment?.value,
        status: payment?.status,
        invoiceUrl: payment?.invoiceUrl || payment?.url || null,
        bankSlipUrl: payment?.bankSlipUrl || null,
        invoicePdfUrl: payment?.invoicePdf || null,
        digitableLine: identificationData?.digitableLine ||
            identificationData?.identificationField,
        barcodeNumber: identificationData?.barcodeNumber,
        pixCopyPaste: pixData?.copyAndPaste ||
            pixData?.payload ||
            pixData?.payloadBase64 ||
            null,
        pixQrCodeImage: pixData?.encodedImage || null,
        pixExpirationDate: pixData?.expirationDate || null
    };
};
exports.getAsaasSecondCopyByCpf = getAsaasSecondCopyByCpf;
const generatePaymentLink = async ({ invoice, provider }) => {
    const tokenRecord = await (0, exports.getCompanyPaymentToken)(invoice.companyId, provider);
    if (!tokenRecord.token) {
        throw new AppError_1.default(`Token para ${provider} inválido.`, 400);
    }
    if (provider === "mercadopago") {
        return generateMercadoPagoLink(invoice, tokenRecord.token);
    }
    if (provider === "asaas") {
        const client = await CrmClient_1.default.findOne({
            where: {
                id: invoice.clientId,
                companyId: invoice.companyId
            }
        });
        if (!client) {
            throw new AppError_1.default("Cliente associado à fatura não encontrado.", 404);
        }
        const customerId = await (0, syncAsaasCustomer_1.default)({
            client,
            token: tokenRecord.token
        });
        return generateAsaasPayment(invoice, tokenRecord.token, customerId);
    }
    throw new AppError_1.default("Gateway não suportado.", 400);
};
exports.generatePaymentLink = generatePaymentLink;
const getAsaasHeaders = async (companyId) => {
    const tokenRecord = await (0, exports.getCompanyPaymentToken)(companyId, "asaas");
    if (!tokenRecord.token) {
        throw new AppError_1.default("Token Asaas não configurado.", 400);
    }
    return {
        headers: {
            "Content-Type": "application/json",
            access_token: tokenRecord.token
        }
    };
};
const sanitize = (payload) => {
    const copy = { ...payload };
    Object.keys(copy).forEach(key => {
        if (copy[key] === undefined || copy[key] === null || copy[key] === "") {
            delete copy[key];
        }
    });
    return copy;
};
const normalizeDocument = (value) => (value || "").replace(/\D/g, "");
const updateAsaasPayment = async (invoice, payload) => {
    if (!invoice.paymentExternalId)
        return;
    const { headers } = await getAsaasHeaders(invoice.companyId);
    await axios_1.default.put(`${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}`, sanitize(payload), { headers });
};
exports.updateAsaasPayment = updateAsaasPayment;
const receiveAsaasPayment = async (invoice, options) => {
    if (!invoice.paymentExternalId)
        return;
    const { headers } = await getAsaasHeaders(invoice.companyId);
    const body = sanitize({
        value: options.value,
        paymentDate: options.paymentDate
            ? new Date(options.paymentDate).toISOString().substring(0, 10)
            : undefined,
        description: options.description
    });
    await axios_1.default.post(`${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}/receive`, body, { headers });
};
exports.receiveAsaasPayment = receiveAsaasPayment;
const cancelAsaasPayment = async (invoice) => {
    if (!invoice.paymentExternalId)
        return;
    const { headers } = await getAsaasHeaders(invoice.companyId);
    try {
        await axios_1.default.delete(`${ASAAS_BASE_URL}/payments/${invoice.paymentExternalId}`, {
            headers
        });
    }
    catch (error) {
        const status = error?.response?.status;
        if (status && [404, 400].includes(status)) {
            return;
        }
        throw error;
    }
};
exports.cancelAsaasPayment = cancelAsaasPayment;
const configureMercadoPago = async (companyId) => {
    const tokenRecord = await (0, exports.getCompanyPaymentToken)(companyId, "mercadopago");
    if (!tokenRecord.token) {
        throw new AppError_1.default("Token Mercado Pago não configurado.", 400);
    }
    mercadopago.configure({
        access_token: tokenRecord.token
    });
};
const cancelMercadoPagoPreference = async (invoice) => {
    if (!invoice.paymentExternalId)
        return;
    await configureMercadoPago(invoice.companyId);
    try {
        await mercadopago.preferences.cancel(invoice.paymentExternalId);
    }
    catch (error) {
        if (error?.status === 404) {
            return;
        }
        throw error;
    }
};
exports.cancelMercadoPagoPreference = cancelMercadoPagoPreference;
const cancelGatewayPayment = async (invoice) => {
    if (!invoice.paymentProvider || !invoice.paymentExternalId) {
        return;
    }
    if (invoice.paymentProvider === "asaas") {
        await (0, exports.cancelAsaasPayment)(invoice);
        return;
    }
    if (invoice.paymentProvider === "mercadopago") {
        await (0, exports.cancelMercadoPagoPreference)(invoice);
    }
};
exports.cancelGatewayPayment = cancelGatewayPayment;
