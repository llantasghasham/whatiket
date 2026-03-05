"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowService_1 = __importDefault(require("./ShowService"));
const UpdateService = async (id, companyId, data) => {
    const negocio = await (0, ShowService_1.default)(id, companyId);
    await negocio.update(data);
    return negocio;
};
exports.default = UpdateService;
