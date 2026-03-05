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
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const CreateCrmClientService = async (data) => {
    const schema = Yup.object().shape({
        companyId: Yup.number().required(),
        type: Yup.string().oneOf(["pf", "pj"]).default("pf"),
        name: Yup.string().required().min(2),
        email: Yup.string().email().nullable(),
        status: Yup.string()
            .oneOf(["active", "inactive", "blocked"])
            .default("active"),
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
        const { Op } = require("sequelize");
        const existingClient = await CrmClient_1.default.findOne({
            where: {
                companyId: data.companyId,
                [Op.or]: duplicateConditions
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
            throw new AppError_1.default(`Cliente já cadastrado com este ${duplicateField} nesta empresa.`);
        }
    }
    // Sanitiza o telefone antes de criar
    const clientData = {
        ...data,
        type: data.type || "pf",
        status: data.status || "active",
        phone: data.phone ? data.phone.replace(/\D/g, "") : undefined
    };
    const client = await CrmClient_1.default.create(clientData);
    return client;
};
exports.default = CreateCrmClientService;
