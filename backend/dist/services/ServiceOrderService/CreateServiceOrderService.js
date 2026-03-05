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
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ServiceOrder_1 = __importDefault(require("../../models/ServiceOrder"));
const ServiceOrderItem_1 = __importDefault(require("../../models/ServiceOrderItem"));
const helpers_1 = require("./helpers");
const ShowServiceOrderService_1 = __importDefault(require("./ShowServiceOrderService"));
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    customerId: Yup.number().required(),
    ticketId: Yup.number().optional().nullable(),
    status: Yup.string().oneOf(["aberta", "em_execucao", "concluida", "entregue", "cancelada"]).optional(),
    garantiaPrazoDias: Yup.number().optional().nullable(),
    entregaPrevista: Yup.date().optional().nullable()
});
const CreateServiceOrderService = async (data) => {
    await schema.validate(data);
    const { companyId, customerId, ticketId, status, garantiaFlag, garantiaPrazoDias, garantiaDescricao, entregaPrevista, pagamentoTipo, gerarFatura, pagamentoManualReferencia, observacoesInternas, observacoesCliente, items = [] } = data;
    const customer = await Contact_1.default.findOne({ where: { id: customerId, companyId } });
    if (!customer) {
        throw new AppError_1.default("ERR_CONTACT_NOT_FOUND", 404);
    }
    if (ticketId) {
        const ticket = await Ticket_1.default.findOne({ where: { id: ticketId, companyId } });
        if (!ticket) {
            throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
        }
    }
    const order = await (0, helpers_1.withTransaction)(async (transaction) => {
        const created = await ServiceOrder_1.default.create({
            companyId,
            customerId,
            ticketId: ticketId || null,
            status: status || "aberta",
            garantiaFlag: garantiaFlag ?? false,
            garantiaPrazoDias: garantiaPrazoDias ?? null,
            garantiaDescricao: garantiaDescricao ?? null,
            entregaPrevista: entregaPrevista ?? null,
            pagamentoTipo: pagamentoTipo ?? null,
            gerarFatura: gerarFatura ?? false,
            pagamentoManualReferencia: pagamentoManualReferencia ?? null,
            observacoesInternas: observacoesInternas ?? null,
            observacoesCliente: observacoesCliente ?? null,
            subtotal: 0,
            descontos: 0,
            total: 0
        }, { transaction });
        const stockAdjustments = [];
        for (const rawItem of items) {
            const built = await (0, helpers_1.buildItemPayload)({ companyId, input: rawItem });
            await ServiceOrderItem_1.default.create({
                ...built.payload,
                serviceOrderId: created.id,
                companyId
            }, { transaction });
            if (built.stockDiscount) {
                stockAdjustments.push({
                    productId: built.stockDiscount.productId,
                    quantity: built.stockDiscount.quantity,
                    type: "decrement"
                });
            }
        }
        if (stockAdjustments.length) {
            await (0, helpers_1.applyStockAdjustments)(companyId, stockAdjustments, transaction);
        }
        await (0, helpers_1.recalcOrderTotals)(created.id, transaction);
        return created;
    });
    return (0, ShowServiceOrderService_1.default)({ companyId, orderId: order.id });
};
exports.default = CreateServiceOrderService;
