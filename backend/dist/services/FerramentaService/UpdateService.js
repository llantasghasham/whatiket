"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowService_1 = __importDefault(require("./ShowService"));
const UpdateService = async (id, data) => {
    const ferramenta = await (0, ShowService_1.default)(id);
    await ferramenta.update(data);
    return ferramenta;
};
exports.default = UpdateService;
