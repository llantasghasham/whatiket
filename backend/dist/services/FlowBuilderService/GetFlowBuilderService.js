"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const AttachToolsEnabledToFlow_1 = __importDefault(require("./AttachToolsEnabledToFlow"));
const GetFlowBuilderService = async ({ companyId, idFlow }) => {
    try {
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowBuilder_1.FlowBuilderModel.findAndCountAll({
            where: {
                company_id: companyId,
                id: idFlow
            }
        });
        let flow = rows[0];
        if (flow) {
            await (0, AttachToolsEnabledToFlow_1.default)(flow, companyId);
        }
        return {
            flow: flow
        };
    }
    catch (error) {
        console.error('Erro ao consultar usuários:', error);
    }
};
exports.default = GetFlowBuilderService;
