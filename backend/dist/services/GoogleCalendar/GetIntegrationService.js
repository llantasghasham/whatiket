"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleCalendarIntegration_1 = __importDefault(require("../../models/GoogleCalendarIntegration"));
const GetIntegrationService = async (companyId) => {
    const integration = await GoogleCalendarIntegration_1.default.findOne({
        where: { companyId }
    });
    return integration;
};
exports.default = GetIntegrationService;
