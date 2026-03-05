"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Company_1 = __importDefault(require("../../models/Company"));
const Affiliate_1 = __importDefault(require("../../models/Affiliate"));
const AffiliateLink_1 = __importDefault(require("../../models/AffiliateLink"));
const affiliateUtils_1 = require("../../utils/affiliateUtils");
const CreateAffiliateService = async ({ companyId, commissionRate = 10.00, minWithdrawAmount = 50.00 }) => {
    // Verificar se a empresa existe
    const company = await Company_1.default.findByPk(companyId);
    if (!company) {
        throw new AppError_1.default("Empresa não encontrada", 404);
    }
    // Verificar se já é afiliado
    const existingAffiliate = await Affiliate_1.default.findOne({
        where: { companyId }
    });
    if (existingAffiliate) {
        throw new AppError_1.default("Empresa já é afiliada", 400);
    }
    // Gerar código único de afiliado
    const affiliateCode = await (0, affiliateUtils_1.generateAffiliateCode)();
    // Criar afiliado
    const affiliate = await Affiliate_1.default.create({
        companyId,
        affiliateCode,
        commissionRate,
        minWithdrawAmount,
        totalEarned: 0,
        totalWithdrawn: 0,
        status: "active"
    });
    // Criar link de indicação padrão
    await AffiliateLink_1.default.create({
        affiliateId: affiliate.id,
        code: affiliateCode,
        url: `${process.env.FRONTEND_URL}/cadastro?aff=${affiliateCode}`,
        clicks: 0,
        signups: 0,
        conversions: 0,
        trackingData: {}
    });
    return affiliate;
};
exports.default = CreateAffiliateService;
