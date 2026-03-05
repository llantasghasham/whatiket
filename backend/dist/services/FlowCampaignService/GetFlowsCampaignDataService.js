"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowCampaign_1 = require("../../models/FlowCampaign");
const GetFlowsCampaignDataService = async ({ companyId, idFlow }) => {
    try {
        // Realiza a consulta com paginação usando findAndCountAll
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        const { count, rows } = await FlowCampaign_1.FlowCampaignModel.findAndCountAll({
            where: {
                id: idFlow
            }
        });
        let hook = rows[0];
        if (hook) {
            // converter phrases de JSON string para array se necessário
            const anyHook = hook;
            const rawPhrases = anyHook.phrases;
            try {
                if (typeof rawPhrases === "string" && rawPhrases.trim().length) {
                    anyHook.phrases = JSON.parse(rawPhrases);
                }
            }
            catch (e) {
                anyHook.phrases = [];
            }
            if (!anyHook.matchType) {
                anyHook.matchType = "contains";
            }
        }
        return {
            details: hook
        };
    }
    catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
    }
};
exports.default = GetFlowsCampaignDataService;
