"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.listCoupons = exports.validateCoupon = void 0;
const Coupon_1 = __importDefault(require("../models/Coupon"));
const affiliateUtils_1 = require("../utils/affiliateUtils");
// Validar cupom (público)
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const { planAmount } = req.query;
        if (!code) {
            return res.status(400).json({ error: "Código do cupom não fornecido" });
        }
        const validation = await (0, affiliateUtils_1.validateCoupon)(code, parseFloat(planAmount));
        return res.json(validation);
    }
    catch (error) {
        console.error("Error validating coupon:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.validateCoupon = validateCoupon;
// Listar cupons (super admin)
const listCoupons = async (req, res) => {
    try {
        const coupons = await Coupon_1.default.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json(coupons);
    }
    catch (error) {
        console.error("Error listing coupons:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.listCoupons = listCoupons;
// Criar cupom (super admin)
const createCoupon = async (req, res) => {
    try {
        const { name, code, discountType = "percentage", discountValue, minPlanAmount = 0, maxUses, validUntil, isActive = true, description } = req.body;
        // Verificar se código já existe
        const existingCoupon = await Coupon_1.default.findOne({
            where: { code: code.toUpperCase() }
        });
        if (existingCoupon) {
            return res.status(400).json({ error: "Código de cupom já existe" });
        }
        const coupon = await Coupon_1.default.create({
            name,
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPlanAmount,
            maxUses,
            usedCount: 0,
            validUntil,
            isActive,
            description
        });
        return res.status(201).json(coupon);
    }
    catch (error) {
        console.error("Error creating coupon:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.createCoupon = createCoupon;
// Atualizar cupom (super admin)
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, discountType, discountValue, minPlanAmount, maxUses, validUntil, isActive, description } = req.body;
        const coupon = await Coupon_1.default.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }
        // Se estiver atualizando o código, verificar se já existe
        if (code && code !== coupon.code) {
            const existingCoupon = await Coupon_1.default.findOne({
                where: { code: code.toUpperCase() }
            });
            if (existingCoupon) {
                return res.status(400).json({ error: "Código de cupom já existe" });
            }
        }
        await coupon.update({
            name: name || coupon.name,
            code: code ? code.toUpperCase() : coupon.code,
            discountType: discountType || coupon.discountType,
            discountValue: discountValue || coupon.discountValue,
            minPlanAmount: minPlanAmount !== undefined ? minPlanAmount : coupon.minPlanAmount,
            maxUses: maxUses !== undefined ? maxUses : coupon.maxUses,
            validUntil: validUntil || coupon.validUntil,
            isActive: isActive !== undefined ? isActive : coupon.isActive,
            description: description !== undefined ? description : coupon.description
        });
        return res.json(coupon);
    }
    catch (error) {
        console.error("Error updating coupon:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.updateCoupon = updateCoupon;
// Deletar cupom (super admin)
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon_1.default.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }
        await coupon.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting coupon:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.deleteCoupon = deleteCoupon;
