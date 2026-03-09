import CompaniesSettings from "../../models/CompaniesSettings";

export const showHubToken = async (companyId: string): Promise<string | null> => {
  const settings = await CompaniesSettings.findOne({
    where: {
      companyId,
    }
  });

  if (!settings || !settings.notificameHub) {
    return null;
  }

  return settings.notificameHub;
};
