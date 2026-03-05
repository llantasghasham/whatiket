/** 
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";

type Params = {
  companyId: number,
  column:string,
  data:string
};

const UpdateCompanySettingsService = async ({companyId, column, data}:Params): Promise<any> => {
  try {
    // Usar método mais seguro do Sequelize para atualizar
    const [results, metadata] = await sequelize.query(
      `UPDATE "CompaniesSettings" SET "${column}" = :data WHERE "companyId" = :companyId`,
      {
        replacements: { data, companyId }
      }
    );

    console.log(`[DEBUG] UpdateCompanySettingsService: Atualizado ${column} = ${data} para companyId ${companyId}`);
    return results;
  } catch (error) {
    console.error(`[ERROR] UpdateCompanySettingsService: Erro ao atualizar ${column}:`, error);
    throw error;
  }
};

export default UpdateCompanySettingsService;