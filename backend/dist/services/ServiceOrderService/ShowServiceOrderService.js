"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ServiceOrder_1 = __importDefault(require("../../models/ServiceOrder"));
const ServiceOrderItem_1 = __importDefault(require("../../models/ServiceOrderItem"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const ShowServiceOrderService = async ({ companyId, orderId }) => {
    const order = await ServiceOrder_1.default.findOne({
        where: { id: orderId, companyId },
        include: [
            {
                model: Contact_1.default,
                as: "customer",
                attributes: ["id", "name", "number", "email"]
            },
            {
                model: Ticket_1.default,
                as: "ticket",
                attributes: ["id", "status"]
            },
            {
                model: ServiceOrderItem_1.default,
                as: "items",
                include: [
                    {
                        model: Produto_1.default,
                        as: "product",
                        attributes: ["id", "nome", "valor", "controleEstoque"]
                    },
                    {
                        model: Servico_1.default,
                        as: "service",
                        attributes: ["id", "nome", "valorOriginal", "valorComDesconto"]
                    }
                ]
            }
        ]
    });
    if (!order) {
        throw new AppError_1.default("ERR_SERVICE_ORDER_NOT_FOUND", 404);
    }
    return order;
};
exports.default = ShowServiceOrderService;
