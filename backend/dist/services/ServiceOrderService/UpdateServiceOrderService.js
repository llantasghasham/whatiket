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
const Produto_1 = __importDefault(require("../../models/Produto"));
const helpers_1 = require("./helpers");
const ShowServiceOrderService_1 = __importDefault(require("./ShowServiceOrderService"));
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    orderId: Yup.number().required(),
    customerId: Yup.number().optional(),
    ticketId: Yup.number().optional().nullable(),
    status: Yup.string()
        .oneOf(["aberta", "em_execucao", "concluida", "entregue", "cancelada"])
        .optional(),
    garantiaPrazoDias: Yup.number().optional().nullable(),
    entregaPrevista: Yup.date().optional().nullable()
});
const UpdateServiceOrderService = async (data) => {
    await schema.validate(data);
    const { companyId, orderId, customerId, ticketId, status, garantiaFlag, garantiaPrazoDias, garantiaDescricao, entregaPrevista, pagamentoTipo, gerarFatura, pagamentoManualReferencia, observacoesInternas, observacoesCliente, items } = data;
    const order = await ServiceOrder_1.default.findOne({
        where: { id: orderId, companyId },
        include: [
            {
                model: ServiceOrderItem_1.default,
                as: "items",
                include: [
                    {
                        model: Produto_1.default,
                        as: "product",
                        attributes: ["id", "controleEstoque"]
                    }
                ]
            }
        ]
    });
    if (!order) {
        throw new AppError_1.default("ERR_SERVICE_ORDER_NOT_FOUND", 404);
    }
    if (customerId) {
        const customer = await Contact_1.default.findOne({ where: { id: customerId, companyId } });
        if (!customer) {
            throw new AppError_1.default("ERR_CONTACT_NOT_FOUND", 404);
        }
    }
    if (ticketId) {
        const ticket = await Ticket_1.default.findOne({ where: { id: ticketId, companyId } });
        if (!ticket) {
            throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
        }
    }
    await (0, helpers_1.withTransaction)(async (transaction) => {
        await order.update({
            customerId: customerId ?? order.customerId,
            ticketId: ticketId === undefined ? order.ticketId : ticketId,
            status: status ?? order.status,
            garantiaFlag: garantiaFlag ?? order.garantiaFlag,
            garantiaPrazoDias: garantiaPrazoDias ?? order.garantiaPrazoDias,
            garantiaDescricao: garantiaDescricao ?? order.garantiaDescricao,
            entregaPrevista: entregaPrevista ?? order.entregaPrevista,
            pagamentoTipo: pagamentoTipo ?? order.pagamentoTipo,
            gerarFatura: gerarFatura ?? order.gerarFatura,
            pagamentoManualReferencia: pagamentoManualReferencia ?? order.pagamentoManualReferencia,
            observacoesInternas: observacoesInternas ?? order.observacoesInternas,
            observacoesCliente: observacoesCliente ?? order.observacoesCliente
        }, { transaction });
        if (Array.isArray(items)) {
            const adjustments = [];
            order.items.forEach((item) => {
                if (item.itemType === "product" && item.productId && item.product?.controleEstoque) {
                    adjustments.push({
                        productId: item.productId,
                        quantity: Number(item.quantity),
                        type: "increment"
                    });
                }
            });
            await ServiceOrderItem_1.default.destroy({ where: { serviceOrderId: order.id }, transaction });
            for (const rawItem of items) {
                const built = await (0, helpers_1.buildItemPayload)({ companyId, input: rawItem });
                await ServiceOrderItem_1.default.create({
                    ...built.payload,
                    serviceOrderId: order.id,
                    companyId
                }, { transaction });
                if (built.stockDiscount) {
                    adjustments.push({
                        productId: built.stockDiscount.productId,
                        quantity: built.stockDiscount.quantity,
                        type: "decrement"
                    });
                }
            }
            if (adjustments.length) {
                await (0, helpers_1.applyStockAdjustments)(companyId, adjustments, transaction);
            }
            await (0, helpers_1.recalcOrderTotals)(order.id, transaction);
        }
    });
    return (0, ShowServiceOrderService_1.default)({ companyId, orderId: order.id });
};
exports.default = UpdateServiceOrderService;
