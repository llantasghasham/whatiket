"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAffiliate = void 0;
const AffiliateLink_1 = __importDefault(require("../models/AffiliateLink"));
const checkAffiliate = async (req, res) => {
    const { code } = req.params;
    if (!code) {
        return res.status(400).json({ error: "Código de afiliado não fornecido" });
    }
    try {
        const affiliateLink = await AffiliateLink_1.default.findOne({
            where: { code: code.toUpperCase() }
        });
        if (!affiliateLink) {
            return res.status(404).json({ error: "Link de afiliado não encontrado" });
        }
        const affiliate = await affiliateLink.getAffiliate();
        if (!affiliate || affiliate.status !== "active") {
            return res.status(400).json({ error: "Afiliado inativo" });
        }
        return res.json({
            valid: true,
            affiliateCode: affiliateLink.code,
            affiliateId: affiliateLink.affiliateId
        });
    }
    catch (error) {
        console.error("Error checking affiliate:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.checkAffiliate = checkAffiliate;
