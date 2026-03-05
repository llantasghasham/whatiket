"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByClient = exports.listByProject = exports.cancel = exports.markAsPaid = exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const Project_1 = __importDefault(require("../../models/Project"));
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const serializeFatura = (fatura) => ({
    id: fatura.id,
    descricao: fatura.descricao,
    valor: fatura.valor,
    valorPago: fatura.valorPago,
    status: fatura.status,
    dataVencimento: fatura.dataVencimento,
    dataPagamento: fatura.dataPagamento,
    tipoReferencia: fatura.tipoReferencia,
    referenciaId: fatura.referenciaId,
    tipoRecorrencia: fatura.tipoRecorrencia,
    quantidadeCiclos: fatura.quantidadeCiclos,
    cicloAtual: fatura.cicloAtual,
    dataInicio: fatura.dataInicio,
    dataFim: fatura.dataFim,
    ativa: fatura.ativa,
    observacoes: fatura.observacoes,
    paymentProvider: fatura.paymentProvider,
    paymentLink: fatura.paymentLink,
    paymentExternalId: fatura.paymentExternalId,
    checkoutToken: fatura.checkoutToken,
    clientId: fatura.clientId,
    client: fatura.client ? {
        id: fatura.client.id,
        name: fatura.client.name,
        email: fatura.client.email,
        phone: fatura.client.phone
    } : null,
    projectId: fatura.projectId,
    project: fatura.project ? {
        id: fatura.project.id,
        name: fatura.project.name,
        status: fatura.project.status
    } : null,
    createdAt: fatura.createdAt,
    updatedAt: fatura.updatedAt
});
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { searchParam, status, tipoRecorrencia, ativa, clientId, projectId, pageNumber = "1", pageSize = "20" } = req.query;
    const whereCondition = { companyId };
    if (searchParam) {
        whereCondition[sequelize_1.Op.or] = [
            { descricao: { [sequelize_1.Op.like]: `%${searchParam}%` } },
            { observacoes: { [sequelize_1.Op.like]: `%${searchParam}%` } }
        ];
    }
    if (status) {
        whereCondition.status = status;
    }
    if (tipoRecorrencia) {
        whereCondition.tipoRecorrencia = tipoRecorrencia;
    }
    if (ativa !== undefined && ativa !== "") {
        whereCondition.ativa = ativa === "true";
    }
    if (clientId) {
        whereCondition.clientId = Number(clientId);
    }
    if (projectId) {
        whereCondition.projectId = Number(projectId);
    }
    const limit = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(pageNumber) || 1, 1) - 1) * limit;
    const { count, rows } = await FinanceiroFatura_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ],
        order: [["dataVencimento", "DESC"]],
        limit,
        offset
    });
    return res.json({
        faturas: rows.map(serializeFatura),
        count,
        hasMore: offset + rows.length < count
    });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            },
            {
                model: FinanceiroPagamento_1.default,
                as: "pagamentos"
            }
        ]
    });
    if (!fatura) {
        throw new AppError_1.default("ERR_FATURA_NOT_FOUND", 404);
    }
    return res.json({
        ...serializeFatura(fatura),
        pagamentos: fatura.pagamentos?.map(p => ({
            id: p.id,
            valor: p.valor,
            dataPagamento: p.dataPagamento,
            metodoPagamento: p.metodoPagamento,
            observacoes: p.observacoes
        })) || []
    });
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { clientId, projectId, descricao, valor, dataVencimento, tipoReferencia, referenciaId, tipoRecorrencia, quantidadeCiclos, dataInicio, dataFim, observacoes, ativa } = req.body;
    if (!clientId) {
        throw new AppError_1.default("ERR_CLIENT_ID_REQUIRED", 400);
    }
    if (!valor) {
        throw new AppError_1.default("ERR_VALOR_REQUIRED", 400);
    }
    if (!dataVencimento) {
        throw new AppError_1.default("ERR_DATA_VENCIMENTO_REQUIRED", 400);
    }
    // Verificar se cliente existe
    const client = await CrmClient_1.default.findOne({
        where: { id: clientId, companyId: externalAuth.companyId }
    });
    if (!client) {
        throw new AppError_1.default("ERR_CLIENT_NOT_FOUND", 404);
    }
    // Verificar se projeto existe (se informado)
    if (projectId) {
        const project = await Project_1.default.findOne({
            where: { id: projectId, companyId: externalAuth.companyId }
        });
        if (!project) {
            throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
        }
    }
    const fatura = await FinanceiroFatura_1.default.create({
        companyId: externalAuth.companyId,
        clientId,
        projectId: projectId || null,
        descricao: descricao || "",
        valor,
        valorPago: 0,
        status: "aberta",
        dataVencimento,
        tipoReferencia: tipoReferencia || null,
        referenciaId: referenciaId || null,
        tipoRecorrencia: tipoRecorrencia || "unica",
        quantidadeCiclos: quantidadeCiclos || null,
        cicloAtual: 1,
        dataInicio: dataInicio || new Date(),
        dataFim: dataFim || null,
        ativa: ativa !== false,
        observacoes: observacoes || null,
        checkoutToken: (0, uuid_1.v4)()
    });
    await fatura.reload({
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "fatura.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            fatura: serializeFatura(fatura)
        }
    });
    return res.status(201).json(serializeFatura(fatura));
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { clientId, projectId, descricao, valor, valorPago, status, dataVencimento, dataPagamento, tipoReferencia, referenciaId, tipoRecorrencia, quantidadeCiclos, cicloAtual, dataInicio, dataFim, ativa, observacoes, paymentProvider, paymentLink, paymentExternalId } = req.body;
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!fatura) {
        throw new AppError_1.default("ERR_FATURA_NOT_FOUND", 404);
    }
    // Verificar cliente se alterado
    if (clientId !== undefined && clientId !== fatura.clientId) {
        const client = await CrmClient_1.default.findOne({
            where: { id: clientId, companyId: externalAuth.companyId }
        });
        if (!client) {
            throw new AppError_1.default("ERR_CLIENT_NOT_FOUND", 404);
        }
    }
    // Verificar projeto se alterado
    if (projectId !== undefined && projectId !== fatura.projectId) {
        if (projectId) {
            const project = await Project_1.default.findOne({
                where: { id: projectId, companyId: externalAuth.companyId }
            });
            if (!project) {
                throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
            }
        }
    }
    const updateData = {};
    if (clientId !== undefined)
        updateData.clientId = clientId;
    if (projectId !== undefined)
        updateData.projectId = projectId;
    if (descricao !== undefined)
        updateData.descricao = descricao;
    if (valor !== undefined)
        updateData.valor = valor;
    if (valorPago !== undefined)
        updateData.valorPago = valorPago;
    if (status !== undefined)
        updateData.status = status;
    if (dataVencimento !== undefined)
        updateData.dataVencimento = dataVencimento;
    if (dataPagamento !== undefined)
        updateData.dataPagamento = dataPagamento;
    if (tipoReferencia !== undefined)
        updateData.tipoReferencia = tipoReferencia;
    if (referenciaId !== undefined)
        updateData.referenciaId = referenciaId;
    if (tipoRecorrencia !== undefined)
        updateData.tipoRecorrencia = tipoRecorrencia;
    if (quantidadeCiclos !== undefined)
        updateData.quantidadeCiclos = quantidadeCiclos;
    if (cicloAtual !== undefined)
        updateData.cicloAtual = cicloAtual;
    if (dataInicio !== undefined)
        updateData.dataInicio = dataInicio;
    if (dataFim !== undefined)
        updateData.dataFim = dataFim;
    if (ativa !== undefined)
        updateData.ativa = ativa;
    if (observacoes !== undefined)
        updateData.observacoes = observacoes;
    if (paymentProvider !== undefined)
        updateData.paymentProvider = paymentProvider;
    if (paymentLink !== undefined)
        updateData.paymentLink = paymentLink;
    if (paymentExternalId !== undefined)
        updateData.paymentExternalId = paymentExternalId;
    await fatura.update(updateData);
    await fatura.reload({
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "fatura.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            fatura: serializeFatura(fatura)
        }
    });
    return res.json(serializeFatura(fatura));
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!fatura) {
        throw new AppError_1.default("ERR_FATURA_NOT_FOUND", 404);
    }
    await fatura.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "fatura.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            faturaId: Number(id)
        }
    });
    return res.json({ message: "Fatura removida com sucesso" });
};
exports.remove = remove;
const markAsPaid = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { dataPagamento, valorPago } = req.body;
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!fatura) {
        throw new AppError_1.default("ERR_FATURA_NOT_FOUND", 404);
    }
    await fatura.update({
        status: "paga",
        dataPagamento: dataPagamento || new Date(),
        valorPago: valorPago || fatura.valor
    });
    await fatura.reload({
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "fatura.paid",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            fatura: serializeFatura(fatura)
        }
    });
    return res.json(serializeFatura(fatura));
};
exports.markAsPaid = markAsPaid;
const cancel = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!fatura) {
        throw new AppError_1.default("ERR_FATURA_NOT_FOUND", 404);
    }
    await fatura.update({ status: "cancelada" });
    await fatura.reload({
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "fatura.cancelled",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            fatura: serializeFatura(fatura)
        }
    });
    return res.json(serializeFatura(fatura));
};
exports.cancel = cancel;
const listByProject = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { projectId } = req.params;
    const faturas = await FinanceiroFatura_1.default.findAll({
        where: { companyId, projectId: Number(projectId) },
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ],
        order: [["dataVencimento", "DESC"]]
    });
    return res.json({
        faturas: faturas.map(serializeFatura)
    });
};
exports.listByProject = listByProject;
const listByClient = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { clientId } = req.params;
    const faturas = await FinanceiroFatura_1.default.findAll({
        where: { companyId, clientId: Number(clientId) },
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            }
        ],
        order: [["dataVencimento", "DESC"]]
    });
    return res.json({
        faturas: faturas.map(serializeFatura)
    });
};
exports.listByClient = listByClient;
