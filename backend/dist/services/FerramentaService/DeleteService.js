"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const ShowService_1 = __importDefault(require("./ShowService"));
const DeleteService = async (id) => {
    const ferramenta = await (0, ShowService_1.default)(id);
    await ferramenta.destroy();
};
exports.default = DeleteService;
