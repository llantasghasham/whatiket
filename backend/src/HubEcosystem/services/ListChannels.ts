import { showHubToken } from "../helpers/showHubToken";
const { Client } = require("notificamehubsdk");
require("dotenv").config();

const ListChannels = async (companyId: string) => {
  try {
    const notificameHubToken = await showHubToken(companyId);

    if (!notificameHubToken) {
      return [];
    }

    const client = new Client(notificameHubToken);
    const response = await client.listChannels();
    return response || [];
  } catch (error: any) {
    console.error("[ListChannels] Error:", error?.message || error);
    return [];
  }
};

export default ListChannels;
