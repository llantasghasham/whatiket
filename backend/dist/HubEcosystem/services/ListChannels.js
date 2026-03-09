"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const showHubToken_1 = require("../helpers/showHubToken");
const { Client } = require("notificamehubsdk");
require("dotenv").config();
const ListChannels = async (companyId) => {
    try {
        const notificameHubToken = await (0, showHubToken_1.showHubToken)(companyId);
        if (!notificameHubToken) {
            return [];
        }
        const client = new Client(notificameHubToken);
        const response = await client.listChannels();
        return response || [];
    }
    catch (error) {
        console.error("[ListChannels] Error:", error?.message || error);
        return [];
    }
};
exports.default = ListChannels;
