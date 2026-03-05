"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyApiKey_1 = __importDefault(require("../../models/CompanyApiKey"));
const UpdateCompanyApiKeyService = async ({ companyId, column, data }) => {
    try {
        // Buscar o registro existente ou criar um novo
        let companyApiKey = await CompanyApiKey_1.default.findOne({
            where: { companyId }
        });
        if (!companyApiKey) {
            // Criar novo registro se não existir
            companyApiKey = await CompanyApiKey_1.default.create({
                companyId,
                label: "API Keys",
                token: "generated-token-" + Date.now(), // Token temporário
            });
        }
        // Atualizar o campo específico
        await companyApiKey.update({ [column]: data });
        console.log(`[DEBUG] UpdateCompanyApiKeyService: Atualizado ${column} = ${data} para companyId ${companyId}`);
        return companyApiKey;
    }
    catch (error) {
        console.error(`[ERROR] UpdateCompanyApiKeyService: Erro ao atualizar ${column}:`, error);
        throw error;
    }
};
exports.default = UpdateCompanyApiKeyService;
