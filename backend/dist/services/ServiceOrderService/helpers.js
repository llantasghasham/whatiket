"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStockAdjustments = exports.withTransaction = exports.recalcOrderTotals = exports.buildItemPayload = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ServiceOrder_1 = __importDefault(require("../../models/ServiceOrder"));
const ServiceOrderItem_1 = __importDefault(require("../../models/ServiceOrderItem"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const buildItemPayload = async ({ companyId, input }) => {
    const quantity = Number(input.quantity ?? 1);
    if (quantity <= 0) {
        throw new AppError_1.default("ERR_SERVICE_ORDER_INVALID_QUANTITY", 400);
    }
    const discount = Number(input.discount ?? 0);
    if (input.itemType === "service") {
        if (!input.serviceId) {
            throw new AppError_1.default("ERR_SERVICE_ORDER_SERVICE_REQUIRED", 400);
        }
        const service = await Servico_1.default.findOne({ where: { id: input.serviceId, companyId } });
        if (!service) {
            throw new AppError_1.default("ERR_SERVICE_NOT_FOUND", 404);
        }
        const unitPrice = Number(input.unitPrice ?? service.valorComDesconto ?? service.valorOriginal ?? 0);
        return {
            payload: {
                itemType: "service",
                serviceId: service.id,
                productId: null,
                description: input.description || service.nome,
                quantity,
                unitPrice,
                discount,
                total: quantity * unitPrice - discount
            }
        };
    }
    if (!input.productId) {
        throw new AppError_1.default("ERR_SERVICE_ORDER_PRODUCT_REQUIRED", 400);
    }
    const product = await Produto_1.default.findOne({ where: { id: input.productId, companyId } });
    if (!product) {
        throw new AppError_1.default("ERR_PRODUCT_NOT_FOUND", 404);
    }
    if (product.controleEstoque && quantity > (product.estoqueAtual ?? 0)) {
        throw new AppError_1.default("ERR_PRODUCT_STOCK_UNAVAILABLE", 400);
    }
    const unitPrice = Number(input.unitPrice ?? product.valor ?? 0);
    return {
        payload: {
            itemType: "product",
            productId: product.id,
            serviceId: null,
            description: input.description || product.nome,
            quantity,
            unitPrice,
            discount,
            total: quantity * unitPrice - discount
        },
        stockDiscount: product.controleEstoque
            ? {
                productId: product.id,
                quantity
            }
            : undefined
    };
};
exports.buildItemPayload = buildItemPayload;
const recalcOrderTotals = async (orderId, transaction) => {
    const items = await ServiceOrderItem_1.default.findAll({ where: { serviceOrderId: orderId }, transaction });
    const subtotal = items.reduce((acc, item) => acc + Number(item.unitPrice) * Number(item.quantity), 0);
    const descontos = items.reduce((acc, item) => acc + Number(item.discount ?? 0), 0);
    const total = items.reduce((acc, item) => acc + Number(item.total ?? 0), 0);
    await ServiceOrder_1.default.update({ subtotal, descontos, total }, { where: { id: orderId }, transaction });
    return { subtotal, descontos, total };
};
exports.recalcOrderTotals = recalcOrderTotals;
const withTransaction = async (fn) => {
    const transaction = await database_1.default.transaction();
    try {
        const result = await fn(transaction);
        await transaction.commit();
        return result;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.withTransaction = withTransaction;
const applyStockAdjustments = async (companyId, adjustments, transaction) => {
    for (const adj of adjustments) {
        const expression = adj.type === "decrement"
            ? (0, sequelize_1.literal)(`GREATEST(0, "estoqueAtual" - ${adj.quantity})`)
            : (0, sequelize_1.literal)(`COALESCE("estoqueAtual", 0) + ${adj.quantity}`);
        await Produto_1.default.update({ estoqueAtual: expression }, { where: { id: adj.productId, companyId }, transaction });
    }
};
exports.applyStockAdjustments = applyStockAdjustments;
