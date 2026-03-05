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
const express_1 = require("express");
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const AffiliateController = __importStar(require("../controllers/AffiliateController"));
const affiliateRoutes = (0, express_1.Router)();
// Rotas públicas
affiliateRoutes.get("/check-affiliate/:code", AffiliateController.checkAffiliate);
// Rotas do afiliado (requer autenticação)
affiliateRoutes.get("/my-info", isAuth_1.default, AffiliateController.getMyAffiliateInfo);
affiliateRoutes.get("/my-links", isAuth_1.default, AffiliateController.getMyLinks);
affiliateRoutes.post("/generate-link", isAuth_1.default, AffiliateController.generateLink);
affiliateRoutes.delete("/links/:linkId", isAuth_1.default, AffiliateController.deleteLink);
affiliateRoutes.get("/my-referrals", isAuth_1.default, AffiliateController.getMyReferrals);
affiliateRoutes.get("/commissions", isAuth_1.default, AffiliateController.getMyCommissions);
affiliateRoutes.get("/commissions/stats", isAuth_1.default, AffiliateController.getCommissionStats);
affiliateRoutes.get("/withdrawals", isAuth_1.default, AffiliateController.getMyWithdrawals);
affiliateRoutes.post("/withdrawals", isAuth_1.default, AffiliateController.requestWithdrawal);
// Rotas do super admin
affiliateRoutes.get("/detail/:id", isAuth_1.default, AffiliateController.getAffiliateById);
affiliateRoutes.get("/stats", isAuth_1.default, AffiliateController.getAffiliateStats);
affiliateRoutes.get("/commissions/admin", isAuth_1.default, AffiliateController.listAllCommissions);
affiliateRoutes.put("/commissions/:id", isAuth_1.default, AffiliateController.updateCommission);
affiliateRoutes.get("/withdrawals/admin", isAuth_1.default, AffiliateController.listAllWithdrawals);
affiliateRoutes.get("/withdrawals/stats", isAuth_1.default, AffiliateController.getWithdrawalStats);
affiliateRoutes.put("/withdrawals/:id", isAuth_1.default, AffiliateController.processWithdrawal);
affiliateRoutes.get("/", isAuth_1.default, AffiliateController.listAffiliates);
affiliateRoutes.post("/", isAuth_1.default, AffiliateController.createAffiliate);
affiliateRoutes.put("/:id", isAuth_1.default, AffiliateController.updateAffiliate);
affiliateRoutes.delete("/:id", isAuth_1.default, AffiliateController.deleteAffiliate);
exports.default = affiliateRoutes;
