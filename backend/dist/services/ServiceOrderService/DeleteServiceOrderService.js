"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ServiceOrder_1 = __importDefault(require("../../models/ServiceOrder"));
const ServiceOrderItem_1 = __importDefault(require("../../models/ServiceOrderItem"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const helpers_1 = require("./helpers");
const DeleteServiceOrderService = async ({ companyId, orderId }) => {
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
    await (0, helpers_1.withTransaction)(async (transaction) => {
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
        await order.destroy({ transaction });
        if (adjustments.length) {
            await (0, helpers_1.applyStockAdjustments)(companyId, adjustments, transaction);
        }
    });
};
exports.default = DeleteServiceOrderService;
