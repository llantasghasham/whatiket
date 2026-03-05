"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const FlowBuilder_1 = require("../../models/FlowBuilder");
const CreateWebHookService_1 = __importDefault(require("./CreateWebHookService"));
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * Garante que exista uma integração flowbuilder para a empresa
 * Usado quando o usuário acessa a página de integrações
 */
const ensureFlowBuilderIntegration = async ({ companyId, userId }) => {
    try {
        logger_1.default.info(`[ensureFlowBuilderIntegration] Checking for company ${companyId}`);
        // Verifica se já existe uma integração com o flowbuilder
        const existingWebhook = await Webhook_1.WebhookModel.findOne({
            where: {
                company_id: companyId,
                name: "flowbuilder"
            }
        });
        if (existingWebhook) {
            logger_1.default.info(`[ensureFlowBuilderIntegration] Webhook already exists for company ${companyId}`);
            return;
        }
        // Verifica se existe algum flow criado nesta empresa
        const flowCount = await FlowBuilder_1.FlowBuilderModel.count({
            where: {
                company_id: companyId
            }
        });
        // Se não há flows, não cria webhook
        if (flowCount === 0) {
            logger_1.default.info(`[ensureFlowBuilderIntegration] No flows found for company ${companyId}, skipping webhook creation`);
            return;
        }
        logger_1.default.info(`[ensureFlowBuilderIntegration] Creating webhook for company ${companyId} (found ${flowCount} flows)`);
        // Cria o webhook automaticamente
        const webhook = await (0, CreateWebHookService_1.default)({
            userId,
            name: "flowbuilder",
            companyId
        });
        if (typeof webhook === 'string') {
            if (webhook === 'exist') {
                logger_1.default.info(`[ensureFlowBuilderIntegration] Webhook already exists for company ${companyId}`);
            }
            else {
                logger_1.default.error(`[ensureFlowBuilderIntegration] Error creating webhook for company ${companyId}: ${webhook}`);
            }
            return;
        }
        logger_1.default.info(`[ensureFlowBuilderIntegration] Webhook created successfully for company ${companyId}, ID: ${webhook.id}`);
    }
    catch (error) {
        logger_1.default.error(`[ensureFlowBuilderIntegration] Error for company ${companyId}:`, error);
    }
};
exports.default = ensureFlowBuilderIntegration;
