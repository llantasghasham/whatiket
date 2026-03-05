"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentGatewayWebhookController_1 = require("../controllers/PaymentGatewayWebhookController");
const paymentGatewayWebhookRoutes = (0, express_1.Router)();
paymentGatewayWebhookRoutes.post("/webhook/payments/mercadopago", PaymentGatewayWebhookController_1.mercadoPagoWebhook);
paymentGatewayWebhookRoutes.post("/webhook/payments/asaas", PaymentGatewayWebhookController_1.asaasWebhook);
exports.default = paymentGatewayWebhookRoutes;
