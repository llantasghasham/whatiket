"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
const database_1 = __importDefault(require("../../database"));
const UpdateCompanySettingsService = async ({ companyId, column, data }) => {
    try {
        // Usar método mais seguro do Sequelize para atualizar
        const [results, metadata] = await database_1.default.query(`UPDATE "CompaniesSettings" SET "${column}" = :data WHERE "companyId" = :companyId`, {
            replacements: { data, companyId }
        });
        console.log(`[DEBUG] UpdateCompanySettingsService: Atualizado ${column} = ${data} para companyId ${companyId}`);
        return results;
    }
    catch (error) {
        console.error(`[ERROR] UpdateCompanySettingsService: Erro ao atualizar ${column}:`, error);
        throw error;
    }
};
exports.default = UpdateCompanySettingsService;
