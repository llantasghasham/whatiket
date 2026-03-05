"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Ferramenta_1 = __importDefault(require("../../models/Ferramenta"));
const CreateService = async (data) => {
    const ferramenta = await Ferramenta_1.default.create(data);
    return ferramenta;
};
exports.default = CreateService;
