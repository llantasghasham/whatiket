"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowCampaign_1 = require("../../models/FlowCampaign");
const CreateFlowCampaignService = async ({ userId, name, companyId, phrase, phrases, matchType, whatsappId, flowId }) => {
    try {
        const phrasesJson = phrases && phrases.length ? JSON.stringify(phrases) : null;
        const matchTypeValue = matchType || "contains";
        const flow = await FlowCampaign_1.FlowCampaignModel.create({
            userId: userId,
            companyId: companyId,
            name: name,
            phrase: phrase,
            phrases: phrasesJson,
            matchType: matchTypeValue,
            flowId: flowId,
            whatsappId: whatsappId
        });
        return flow;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = CreateFlowCampaignService;
