"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHubToken = void 0;
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const showHubToken = async (companyId) => {
    const settings = await CompaniesSettings_1.default.findOne({
        where: {
            companyId,
        }
    });
    if (!settings || !settings.notificameHub) {
        return null;
    }
    return settings.notificameHub;
};
exports.showHubToken = showHubToken;
