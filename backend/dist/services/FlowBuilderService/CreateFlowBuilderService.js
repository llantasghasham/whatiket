"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const ensureFlowBuilderWebhook_1 = __importDefault(require("./ensureFlowBuilderWebhook"));
const logger_1 = __importDefault(require("../../utils/logger"));
const CreateFlowBuilderService = async ({ userId, name, companyId }) => {
    try {
        logger_1.default.info(`[CreateFlowBuilderService] Starting for company ${companyId}, user ${userId}, flow name: ${name}`);
        const nameExist = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                name,
                company_id: companyId
            }
        });
        if (nameExist) {
            logger_1.default.info(`[CreateFlowBuilderService] Flow with name "${name}" already exists for company ${companyId}`);
            return 'exist';
        }
        const flow = await FlowBuilder_1.FlowBuilderModel.create({
            user_id: userId,
            company_id: companyId,
            name: name,
        });
        logger_1.default.info(`[CreateFlowBuilderService] Flow created with ID: ${flow.id}`);
        // Verifica se é o primeiro flow e cria webhook se necessário
        const totalFlows = await FlowBuilder_1.FlowBuilderModel.count({
            where: {
                company_id: companyId
            }
        });
        logger_1.default.info(`[CreateFlowBuilderService] Total flows for company ${companyId}: ${totalFlows}`);
        if (totalFlows === 1) {
            logger_1.default.info(`[CreateFlowBuilderService] First flow detected, ensuring FlowBuilder webhook exists`);
            await (0, ensureFlowBuilderWebhook_1.default)({
                companyId,
                userId
            });
        }
        else {
            logger_1.default.info(`[CreateFlowBuilderService] Not the first flow, skipping webhook creation`);
        }
        return flow;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = CreateFlowBuilderService;
