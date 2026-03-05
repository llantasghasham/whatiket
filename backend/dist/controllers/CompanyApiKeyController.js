"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const UpdateCompanyApiKeyService_1 = __importDefault(require("../services/CompanyApiKeyService/UpdateCompanyApiKeyService"));
const update = async (req, res) => {
    const { column, data } = req.body;
    const { companyId } = req.user;
    try {
        const result = await (0, UpdateCompanyApiKeyService_1.default)({
            companyId,
            column,
            data
        });
        return res.status(200).json({ response: true, result });
    }
    catch (error) {
        console.error("[ERROR] CompanyApiKeyController.update:", error);
        return res.status(400).json({ error: "Failed to update API key" });
    }
};
exports.update = update;
