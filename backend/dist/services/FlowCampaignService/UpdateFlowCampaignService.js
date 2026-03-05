"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowCampaign_1 = require("../../models/FlowCampaign");
const UpdateFlowCampaignService = async ({ companyId, name, flowId, phrase, phrases, matchType, id, status }) => {
    try {
        const phrasesJson = phrases && phrases.length ? JSON.stringify(phrases) : null;
        const matchTypeValue = matchType || "contains";
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        const flow = await FlowCampaign_1.FlowCampaignModel.update({ name, phrase, phrases: phrasesJson, matchType: matchTypeValue, flowId, status }, {
            where: { id: id }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UpdateFlowCampaignService;
