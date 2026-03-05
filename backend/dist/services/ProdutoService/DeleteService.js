"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Produto_1 = __importDefault(require("../../models/Produto"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteService = async (id, companyId) => {
    const produto = await Produto_1.default.findOne({
        where: {
            id,
            companyId
        }
    });
    if (!produto) {
        throw new AppError_1.default("ERR_PRODUTO_NOT_FOUND", 404);
    }
    await produto.destroy();
};
exports.default = DeleteService;
