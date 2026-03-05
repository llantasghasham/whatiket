"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCheckout = void 0;
const sequelize_1 = require("sequelize");
const FinanceiroFatura_1 = __importDefault(require("../models/FinanceiroFatura"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const showCheckout = async (req, res) => {
    const { token } = req.params;
    const invoice = await FinanceiroFatura_1.default.findOne({
        where: {
            checkoutToken: token,
            paymentLink: {
                [sequelize_1.Op.ne]: null
            }
        },
        include: [
            {
                association: "client",
                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "document",
                    "zipCode",
                    "address",
                    "number",
                    "complement",
                    "neighborhood",
                    "city",
                    "state"
                ]
            }
        ]
    });
    if (!invoice) {
        throw new AppError_1.default("Checkout não encontrado ou indisponível.", 404);
    }
    return res.json({
        id: invoice.id,
        descricao: invoice.descricao,
        valor: invoice.valor,
        status: invoice.status,
        dataVencimento: invoice.dataVencimento,
        paymentProvider: invoice.paymentProvider,
        paymentLink: invoice.paymentLink,
        paymentExternalId: invoice.paymentExternalId,
        client: invoice.client,
        companyId: invoice.companyId
    });
};
exports.showCheckout = showCheckout;
