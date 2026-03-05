"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const CreateWebHookService_1 = __importDefault(require("../WebhookService/CreateWebHookService"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ensureFlowBuilderWebhook = async ({ companyId, userId }) => {
    try {
        logger_1.default.info(`[ensureFlowBuilderWebhook] Starting for company ${companyId}`);
        // Verifica se já existe uma integração com o flowbuilder PARA ESTA EMPRESA
        const existingWebhook = await Webhook_1.WebhookModel.findOne({
            where: {
                company_id: companyId,
                name: "flowbuilder"
            }
        });
        if (existingWebhook) {
            logger_1.default.info(`[ensureFlowBuilderWebhook] Webhook already exists for company ${companyId}:`, {
                id: existingWebhook.id,
                name: existingWebhook.name,
                active: existingWebhook.active,
                hash_id: existingWebhook.hash_id
            });
            // Se o webhook existe mas está inativo, reativa
            if (!existingWebhook.active) {
                logger_1.default.info(`[ensureFlowBuilderWebhook] Reactivating webhook for company ${companyId}`);
                await existingWebhook.update({ active: true });
                logger_1.default.info(`[ensureFlowBuilderWebhook] Webhook reactivated successfully`);
            }
            return;
        }
        logger_1.default.info(`[ensureFlowBuilderWebhook] No existing webhook found for company ${companyId}, creating new one`);
        // Cria o webhook automaticamente para esta empresa
        const webhook = await (0, CreateWebHookService_1.default)({
            userId,
            name: "flowbuilder",
            companyId
        });
        logger_1.default.info(`[ensureFlowBuilderWebhook] CreateWebHookService returned:`, typeof webhook, webhook);
        if (typeof webhook === 'string') {
            if (webhook === 'exist') {
                logger_1.default.info(`[ensureFlowBuilderWebhook] Webhook already exists (returned 'exist') for company ${companyId}`);
            }
            else {
                logger_1.default.error(`[ensureFlowBuilderWebhook] Error creating webhook for company ${companyId}: ${webhook}`);
            }
            return;
        }
        logger_1.default.info(`[ensureFlowBuilderWebhook] Webhook created successfully for company ${companyId}:`, {
            id: webhook.id,
            name: webhook.name,
            active: webhook.active,
            hash_id: webhook.hash_id
        });
    }
    catch (error) {
        logger_1.default.error(`[ensureFlowBuilderWebhook] Error for company ${companyId}:`, error);
    }
};
exports.default = ensureFlowBuilderWebhook;
