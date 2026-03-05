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
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    fornecedorId: Yup.number().nullable(),
    categoriaId: Yup.number().nullable(),
    descricao: Yup.string().required().max(255),
    valor: Yup.number().required().moreThan(0),
    status: Yup.string()
        .oneOf(["aberta", "paga", "vencida", "cancelada"])
        .default("aberta"),
    dataVencimento: Yup.date().required(),
    dataPagamento: Yup.date().nullable(),
    metodoPagamentoPrevisto: Yup.string().max(50).nullable(),
    metodoPagamentoReal: Yup.string().max(50).nullable(),
    observacoes: Yup.string().nullable(),
    anexoUrl: Yup.string().max(500).nullable(),
    recorrente: Yup.boolean().default(false),
    dataInicio: Yup.date().nullable(),
    dataFim: Yup.date().nullable(),
    tipoRecorrencia: Yup.string()
        .oneOf(["diario", "semanal", "mensal", "anual"])
        .nullable()
        .default("mensal"),
    quantidadeCiclos: Yup.number().integer().positive().nullable(),
    cicloAtual: Yup.number().integer().min(1).default(1)
});
const CreateFinanceiroDespesaService = async ({ companyId, fornecedorId, categoriaId, descricao, valor, status = "aberta", dataVencimento, dataPagamento, metodoPagamentoPrevisto, metodoPagamentoReal, observacoes, anexoUrl, recorrente = false, dataInicio, dataFim, tipoRecorrencia = "mensal", quantidadeCiclos, cicloAtual = 1, transaction }) => {
    try {
        await schema.validate({
            companyId,
            fornecedorId,
            categoriaId,
            descricao,
            valor,
            status,
            dataVencimento,
            dataPagamento,
            metodoPagamentoPrevisto,
            metodoPagamentoReal,
            observacoes,
            anexoUrl,
            recorrente,
            dataInicio,
            dataFim,
            tipoRecorrencia,
            quantidadeCiclos,
            cicloAtual
        });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    // Validar fornecedor
    if (fornecedorId) {
        const fornecedor = await FinanceiroFornecedor_1.default.findOne({
            where: {
                id: fornecedorId,
                companyId
            },
            transaction
        });
        if (!fornecedor) {
            throw new AppError_1.default("Fornecedor não encontrado.");
        }
    }
    // Validar categoria
    if (categoriaId) {
        const categoria = await FinanceiroCategoria_1.default.findOne({
            where: {
                id: categoriaId,
                companyId
            },
            transaction
        });
        if (!categoria) {
            throw new AppError_1.default("Categoria não encontrada.");
        }
        if (categoria.tipo !== "despesa") {
            throw new AppError_1.default("Categoria deve ser do tipo despesa.");
        }
    }
    // Validar status
    if (status === "paga" && !dataPagamento) {
        throw new AppError_1.default("Despesa paga deve ter data de pagamento.");
    }
    // Validar recorrência
    if (recorrente && !dataInicio) {
        throw new AppError_1.default("Despesa recorrente deve ter data de início.");
    }
    const despesa = await FinanceiroDespesa_1.default.create({
        companyId,
        fornecedorId,
        categoriaId,
        descricao: descricao.trim(),
        valor: Number(valor),
        status,
        dataVencimento,
        dataPagamento,
        metodoPagamentoPrevisto,
        metodoPagamentoReal,
        observacoes: observacoes?.trim() || null,
        anexoUrl,
        recorrente,
        dataInicio,
        dataFim,
        tipoRecorrencia,
        quantidadeCiclos,
        cicloAtual
    }, {
        include: [
            {
                association: "fornecedor"
            },
            {
                association: "categoria"
            }
        ],
        transaction
    });
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_despesa", {
        action: "create",
        data: despesa
    });
    return despesa;
};
exports.default = CreateFinanceiroDespesaService;
