"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ShowCrmClientService = async ({ id, companyId }) => {
    const client = await CrmClient_1.default.findOne({
        where: { id, companyId }
    });
    if (!client) {
        throw new AppError_1.default("Cliente não encontrado.", 404);
    }
    return client;
};
exports.default = ShowCrmClientService;
