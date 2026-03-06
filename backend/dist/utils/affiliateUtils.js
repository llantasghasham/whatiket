"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.calculateCommission = exports.generateAffiliateCode = void 0;
const crypto = __importStar(require("crypto"));
const Affiliate_1 = __importDefault(require("../models/Affiliate"));
const generateAffiliateCode = async () => {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    do {
        // Gerar código de 6 caracteres alfanuméricos
        code = crypto.randomBytes(3).toString('hex').toUpperCase();
        // Verificar se já existe
        const existing = await Affiliate_1.default.findOne({
            where: { affiliateCode: code }
        });
        isUnique = !existing;
        attempts++;
        if (attempts >= maxAttempts) {
            // Se não conseguir único após várias tentativas, usar timestamp
            code = `AFF${Date.now().toString(36).toUpperCase()}`;
            isUnique = true;
        }
    } while (!isUnique);
    return code;
};
exports.generateAffiliateCode = generateAffiliateCode;
const calculateCommission = (invoiceAmount, commissionRate) => {
    return (invoiceAmount * commissionRate) / 100;
};
exports.calculateCommission = calculateCommission;
const validateCoupon = async (code, planAmount) => {
    const Coupon = require("../models/Coupon").default;
    const coupon = await Coupon.findOne({
        where: {
            code: code.toUpperCase(),
            isActive: true
        }
    });
    if (!coupon) {
        return { valid: false, error: "Cupom inválido" };
    }
    // Verificar validade
    if (coupon.validUntil && new Date() > coupon.validUntil) {
        return { valid: false, error: "Cupom expirado" };
    }
    // Verificar usos máximos
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, error: "Cupom esgotado" };
    }
    // Verificar valor mínimo
    if (coupon.minPlanAmount && planAmount < coupon.minPlanAmount) {
        return { valid: false, error: `Valor mínimo de $ ${coupon.minPlanAmount}` };
    }
    // Calcular desconto
    let discountAmount;
    if (coupon.discountType === "percentage") {
        discountAmount = (planAmount * coupon.discountValue) / 100;
    }
    else {
        discountAmount = coupon.discountValue;
    }
    return { valid: true, discountAmount };
};
exports.validateCoupon = validateCoupon;
