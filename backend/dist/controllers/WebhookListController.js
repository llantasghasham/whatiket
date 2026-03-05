"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const ListWebHookService_1 = __importDefault(require("../services/WebhookService/ListWebHookService"));
// Listar todas as integrações (webhooks) da empresa
const list = async (req, res) => {
    try {
        const { companyId } = req.user;
        const userId = parseInt(req.user.id);
        const webhooks = await (0, ListWebHookService_1.default)({
            companyId,
            userId
        });
        return res.status(200).json(webhooks);
    }
    catch (error) {
        console.error("Erro ao listar webhooks:", error);
        return res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
};
exports.list = list;
