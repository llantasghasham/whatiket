"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const ASAAS_BASE_URL = "https://api.asaas.com/v3";
const buildCustomerPayload = (client) => {
    if (!client.name && !client.companyName) {
        throw new AppError_1.default("Cliente sem nome para cadastro no Asaas.", 400);
    }
    const payload = {
        name: client.name || client.companyName,
        cpfCnpj: client.document || undefined,
        email: client.email || undefined,
        phone: client.phone || undefined,
        mobilePhone: client.phone || undefined,
        address: client.address || undefined,
        addressNumber: client.number || undefined,
        complement: client.complement || undefined,
        province: client.neighborhood || undefined,
        city: client.city || undefined,
        state: client.state || undefined,
        postalCode: client.zipCode || undefined,
        externalReference: String(client.id)
    };
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
            delete payload[key];
        }
    });
    return payload;
};
const syncAsaasCustomer = async ({ client, token }) => {
    const headers = {
        "Content-Type": "application/json",
        access_token: token
    };
    const payload = buildCustomerPayload(client);
    if (client.asaasCustomerId) {
        try {
            await axios_1.default.put(`${ASAAS_BASE_URL}/customers/${client.asaasCustomerId}`, payload, { headers });
            return client.asaasCustomerId;
        }
        catch (error) {
            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }
    const response = await axios_1.default.post(`${ASAAS_BASE_URL}/customers`, payload, {
        headers
    });
    const customerId = response.data?.id;
    if (!customerId) {
        throw new AppError_1.default("Asaas não retornou o ID do cliente.", 400);
    }
    await client.update({ asaasCustomerId: customerId });
    return customerId;
};
exports.default = syncAsaasCustomer;
