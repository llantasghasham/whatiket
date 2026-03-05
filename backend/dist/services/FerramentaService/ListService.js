"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Ferramenta_1 = __importDefault(require("../../models/Ferramenta"));
const ListService = async ({ status, companyId }) => {
    const where = { companyId };
    if (status) {
        where.status = status;
    }
    const ferramentas = await Ferramenta_1.default.findAll({
        where,
        order: [["createdAt", "DESC"]]
    });
    return ferramentas;
};
exports.default = ListService;
