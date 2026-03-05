"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const UpdateCrmClientService = async ({ id, companyId, ...data }) => {
    const client = await CrmClient_1.default.findOne({
        where: { id, companyId }
    });
    if (!client) {
        throw new AppError_1.default("Cliente não encontrado.", 404);
    }
    const schema = Yup.object().shape({
        type: Yup.string().oneOf(["pf", "pj"]),
        name: Yup.string().min(2),
        email: Yup.string().email().nullable(),
        status: Yup.string().oneOf(["active", "inactive", "blocked"]).nullable(),
        state: Yup.string().length(2).nullable()
    });
    await schema.validate(data);
    // Verificação de duplicatas por documento, email ou telefone
    const duplicateConditions = [];
    if (data.document) {
        duplicateConditions.push({ document: data.document });
    }
    if (data.email) {
        duplicateConditions.push({ email: data.email });
    }
    if (data.phone) {
        const sanitizedPhone = data.phone.replace(/\D/g, "");
        if (sanitizedPhone) {
            duplicateConditions.push({ phone: sanitizedPhone });
        }
    }
    if (duplicateConditions.length > 0) {
        const existingClient = await CrmClient_1.default.findOne({
            where: {
                companyId,
                id: { [sequelize_1.Op.ne]: id },
                [sequelize_1.Op.or]: duplicateConditions
            }
        });
        if (existingClient) {
            let duplicateField = "";
            if (data.document && existingClient.document === data.document) {
                duplicateField = "documento";
            }
            else if (data.email && existingClient.email === data.email) {
                duplicateField = "email";
            }
            else if (data.phone) {
                const sanitizedPhone = data.phone.replace(/\D/g, "");
                if (existingClient.phone === sanitizedPhone) {
                    duplicateField = "telefone";
                }
            }
            throw new AppError_1.default(`Outro cliente já usa este ${duplicateField} nesta empresa.`);
        }
    }
    // Sanitiza o telefone antes de atualizar
    const updateData = {
        ...data,
        phone: data.phone ? data.phone.replace(/\D/g, "") : data.phone
    };
    await client.update(updateData);
    return client;
};
exports.default = UpdateCrmClientService;
