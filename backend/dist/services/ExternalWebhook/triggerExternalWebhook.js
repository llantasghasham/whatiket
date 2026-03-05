"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const logger_1 = __importDefault(require("../../utils/logger"));
const triggerExternalWebhook = async ({ url, secret, event, data }) => {
    if (!url) {
        return;
    }
    try {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };
        const headers = {
            "Content-Type": "application/json"
        };
        if (secret) {
            const signature = (0, crypto_1.createHmac)("sha256", secret)
                .update(JSON.stringify(payload))
                .digest("hex");
            headers["X-Webhook-Signature"] = signature;
        }
        await axios_1.default.post(url, payload, {
            headers,
            timeout: 5000
        });
    }
    catch (error) {
        logger_1.default.error({ error }, "Erro ao disparar webhook externo");
    }
};
exports.default = triggerExternalWebhook;
