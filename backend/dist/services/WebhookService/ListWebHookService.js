"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const ensureFlowBuilderIntegration_1 = __importDefault(require("./ensureFlowBuilderIntegration"));
const ListWebHookService = async ({ companyId, userId }) => {
    try {
        // Garante que exista integração flowbuilder se houver flows
        if (userId) {
            await (0, ensureFlowBuilderIntegration_1.default)({
                companyId,
                userId
            });
        }
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await Webhook_1.WebhookModel.findAndCountAll({
            where: {
                company_id: companyId
            }
        });
        const hooks = [];
        rows.forEach((usuario) => {
            hooks.push(usuario.toJSON());
        });
        return {
            webhooks: hooks,
            hasMore: true,
            count: count
        };
    }
    catch (error) {
        console.error('Erro ao consultar usuários:', error);
    }
};
exports.default = ListWebHookService;
