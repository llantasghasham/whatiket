"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Negocio_1 = __importDefault(require("../../models/Negocio"));
const ListService = async (companyId) => {
    const negocios = await Negocio_1.default.findAll({
        where: { companyId },
        order: [["createdAt", "DESC"]]
    });
    return negocios;
};
exports.default = ListService;
