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
const sequelize_1 = require("sequelize");
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const schema = Yup.object().shape({
    id: Yup.number().required(),
    companyId: Yup.number().required(),
    nome: Yup.string().max(150),
    documento: Yup.string().max(30).nullable(),
    email: Yup.string().email().max(150).nullable(),
    telefone: Yup.string().max(30).nullable(),
    endereco: Yup.string().max(255).nullable(),
    numero: Yup.string().max(20).nullable(),
    complemento: Yup.string().max(100).nullable(),
    bairro: Yup.string().max(100).nullable(),
    cidade: Yup.string().max(100).nullable(),
    estado: Yup.string().max(2).nullable(),
    cep: Yup.string().max(10).nullable(),
    categoria: Yup.string().max(50).nullable(),
    observacoes: Yup.string().nullable(),
    ativo: Yup.boolean()
});
const UpdateFinanceiroFornecedorService = async ({ id, companyId, nome, documento, email, telefone, endereco, numero, complemento, bairro, cidade, estado, cep, categoria, observacoes, ativo, transaction }) => {
    try {
        await schema.validate({
            id: Number(id),
            companyId,
            nome,
            documento,
            email,
            telefone,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            cep,
            categoria,
            observacoes,
            ativo
        });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const fornecedor = await FinanceiroFornecedor_1.default.findByPk(id, {
        transaction
    });
    if (!fornecedor) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
    }
    // Verificar se já existe outro fornecedor com mesmo documento
    if (documento !== undefined && documento !== fornecedor.documento) {
        if (documento) {
            const existingFornecedor = await FinanceiroFornecedor_1.default.findOne({
                where: {
                    companyId,
                    documento: documento.trim(),
                    id: { [sequelize_1.Op.ne]: fornecedor.id }
                },
                transaction
            });
            if (existingFornecedor) {
                throw new AppError_1.default("Já existe um fornecedor com este documento.");
            }
        }
    }
    await fornecedor.update({
        nome: nome?.trim() || fornecedor.nome,
        documento: documento?.trim() || null,
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        endereco: endereco?.trim() || null,
        numero: numero?.trim() || null,
        complemento: complemento?.trim() || null,
        bairro: bairro?.trim() || null,
        cidade: cidade?.trim() || null,
        estado: estado?.trim() || null,
        cep: cep?.trim() || null,
        categoria: categoria?.trim() || null,
        observacoes: observacoes?.trim() || null,
        ativo: ativo !== undefined ? ativo : fornecedor.ativo
    }, {
        transaction
    });
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_fornecedor", {
        action: "update",
        data: fornecedor
    });
    return fornecedor;
};
exports.default = UpdateFinanceiroFornecedorService;
