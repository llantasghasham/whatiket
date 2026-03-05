"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAffiliate = exports.updateAffiliate = exports.processWithdrawal = exports.getWithdrawalStats = exports.listAllWithdrawals = exports.updateCommission = exports.listAllCommissions = exports.getAffiliateStats = exports.requestWithdrawal = exports.getMyWithdrawals = exports.getCommissionStats = exports.getMyCommissions = exports.getMyReferrals = exports.deleteLink = exports.generateLink = exports.getMyLinks = exports.getMyAffiliateInfo = exports.createAffiliate = exports.listAffiliates = exports.getAffiliateById = exports.checkAffiliate = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const AffiliateLink_1 = __importDefault(require("../models/AffiliateLink"));
const AffiliateCommission_1 = __importDefault(require("../models/AffiliateCommission"));
const AffiliateWithdrawal_1 = __importDefault(require("../models/AffiliateWithdrawal"));
const Company_1 = __importDefault(require("../models/Company"));
const FinanceiroFatura_1 = __importDefault(require("../models/FinanceiroFatura"));
const Plan_1 = __importDefault(require("../models/Plan"));
const affiliateUtils_1 = require("../utils/affiliateUtils");
// Lazy loading to avoid circular dependency
const getAffiliateModel = () => require("../models/Affiliate").default;
// Endpoint público para verificar afiliado
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
        // Registrar clique no link
        await affiliateLink.increment("clicks");
        const trackingData = affiliateLink.trackingData || {};
        const today = new Date().toISOString().split('T')[0];
        if (!trackingData[today])
            trackingData[today] = { clicks: 0, signups: 0 };
        trackingData[today].clicks++;
        await affiliateLink.update({ trackingData });
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
// Buscar afiliado por ID (super admin)
const getAffiliateById = async (req, res) => {
    try {
        const { id } = req.params;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findByPk(id, {
            include: [
                {
                    model: require("../models/Company").default,
                    as: "company"
                }
            ]
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        // Buscar links, comissões e saques do afiliado
        const AffiliateLink = require("../models/AffiliateLink").default;
        const links = await AffiliateLink.findAll({
            where: { affiliateId: id },
            order: [["createdAt", "DESC"]]
        });
        const commissions = await AffiliateCommission_1.default.findAll({
            where: { affiliateId: id },
            order: [["createdAt", "DESC"]]
        });
        const withdrawals = await AffiliateWithdrawal_1.default.findAll({
            where: { affiliateId: id },
            order: [["createdAt", "DESC"]]
        });
        return res.json({
            affiliate,
            links,
            commissions,
            withdrawals
        });
    }
    catch (error) {
        console.error("Error getting affiliate by id:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getAffiliateById = getAffiliateById;
// Listar todos os afiliados (super admin)
const listAffiliates = async (req, res) => {
    try {
        const Affiliate = getAffiliateModel();
        const affiliates = await Affiliate.findAll({
            include: [
                {
                    model: require("../models/Company").default,
                    as: "company"
                }
            ],
            order: [["createdAt", "DESC"]]
        });
        return res.json(affiliates);
    }
    catch (error) {
        console.error("Error listing affiliates:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.listAffiliates = listAffiliates;
// Criar afiliado (super admin)
const createAffiliate = async (req, res) => {
    try {
        const { companyId, commissionRate = 10.00, minWithdrawAmount = 50.00 } = req.body;
        const CreateAffiliateService = require("../services/AffiliateService/CreateAffiliateService").default;
        const affiliate = await CreateAffiliateService({
            companyId,
            commissionRate,
            minWithdrawAmount
        });
        return res.status(201).json(affiliate);
    }
    catch (error) {
        console.error("Error creating affiliate:", error);
        if (error instanceof AppError_1.default) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.createAffiliate = createAffiliate;
// Obter informações do afiliado logado
const getMyAffiliateInfo = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        return res.json(affiliate);
    }
    catch (error) {
        console.error("Error getting affiliate info:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getMyAffiliateInfo = getMyAffiliateInfo;
// Obter links do afiliado
const getMyLinks = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const links = await AffiliateLink_1.default.findAll({
            where: { affiliateId: affiliate.id },
            order: [["createdAt", "DESC"]]
        });
        return res.json(links);
    }
    catch (error) {
        console.error("Error getting affiliate links:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getMyLinks = getMyLinks;
// Gerar novo link
const generateLink = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const code = await (0, affiliateUtils_1.generateAffiliateCode)();
        const url = `${process.env.FRONTEND_URL}/cadastro?aff=${code}`;
        const link = await AffiliateLink_1.default.create({
            affiliateId: affiliate.id,
            code,
            url,
            clicks: 0,
            signups: 0,
            conversions: 0,
            trackingData: {}
        });
        return res.status(201).json(link);
    }
    catch (error) {
        console.error("Error generating link:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.generateLink = generateLink;
// Excluir link de afiliado
const deleteLink = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { linkId } = req.params;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const link = await AffiliateLink_1.default.findOne({
            where: { id: linkId, affiliateId: affiliate.id }
        });
        if (!link) {
            return res.status(404).json({ error: "Link não encontrado" });
        }
        await link.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting link:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.deleteLink = deleteLink;
// Obter empresas indicadas pelo afiliado
const getMyReferrals = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        // Buscar empresas que foram indicadas por este afiliado
        const referredCompanies = await Company_1.default.findAll({
            where: { affiliateId: affiliate.id },
            attributes: ["id", "name", "email", "phone", "status", "dueDate", "planId", "createdAt"],
            include: [{ model: Plan_1.default, as: "plan", attributes: ["id", "name", "amount"] }],
            order: [["createdAt", "DESC"]]
        });
        // Para cada empresa, buscar faturas e comissões
        const referrals = await Promise.all(referredCompanies.map(async (company) => {
            const companyData = company.toJSON();
            // Determinar status da empresa
            let companyStatus = "teste";
            const now = new Date();
            const dueDate = company.dueDate ? new Date(company.dueDate) : null;
            // Buscar faturas pagas
            const faturasPagas = await FinanceiroFatura_1.default.count({
                where: { companyId: company.id, status: "paga" }
            });
            const faturasAbertas = await FinanceiroFatura_1.default.count({
                where: { companyId: company.id, status: "aberta" }
            });
            const faturasVencidas = await FinanceiroFatura_1.default.count({
                where: { companyId: company.id, status: "vencida" }
            });
            if (faturasPagas > 0) {
                companyStatus = "ativa";
            }
            if (faturasVencidas > 0) {
                companyStatus = "inadimplente";
            }
            if (faturasPagas === 0 && faturasAbertas === 0 && faturasVencidas === 0) {
                companyStatus = "teste";
            }
            if (company.status === false) {
                companyStatus = "inativa";
            }
            // Buscar comissões geradas por esta empresa
            const commissions = await AffiliateCommission_1.default.findAll({
                where: {
                    affiliateId: affiliate.id,
                    referredCompanyId: company.id
                },
                attributes: ["id", "commissionAmount", "status", "createdAt", "faturaId"],
                order: [["createdAt", "DESC"]]
            });
            const totalCommission = commissions.reduce((sum, c) => sum + parseFloat(String(c.commissionAmount || 0)), 0);
            const pendingCommission = commissions
                .filter((c) => c.status === "pending")
                .reduce((sum, c) => sum + parseFloat(String(c.commissionAmount || 0)), 0);
            return {
                id: company.id,
                name: companyData.name,
                email: companyData.email,
                phone: companyData.phone,
                plan: companyData.plan,
                companyStatus,
                faturasPagas,
                faturasAbertas,
                faturasVencidas,
                totalCommission,
                pendingCommission,
                commissionsCount: commissions.length,
                createdAt: companyData.createdAt
            };
        }));
        // Estatísticas gerais
        const stats = {
            totalReferrals: referrals.length,
            activeReferrals: referrals.filter(r => r.companyStatus === "ativa").length,
            trialReferrals: referrals.filter(r => r.companyStatus === "teste").length,
            overdueReferrals: referrals.filter(r => r.companyStatus === "inadimplente").length,
            inactiveReferrals: referrals.filter(r => r.companyStatus === "inativa").length,
            totalCommissions: referrals.reduce((sum, r) => sum + r.totalCommission, 0),
            pendingCommissions: referrals.reduce((sum, r) => sum + r.pendingCommission, 0)
        };
        return res.json({ referrals, stats });
    }
    catch (error) {
        console.error("Error getting referrals:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getMyReferrals = getMyReferrals;
// Obter comissões do afiliado
const getMyCommissions = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { page = 1, limit = 20, status } = req.query;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const whereClause = { affiliateId: affiliate.id };
        if (status) {
            whereClause.status = status;
        }
        const commissions = await AffiliateCommission_1.default.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["createdAt", "DESC"]]
        });
        return res.json({
            commissions: commissions.rows,
            count: commissions.count,
            hasMore: commissions.count > (parseInt(page) * parseInt(limit))
        });
    }
    catch (error) {
        console.error("Error getting commissions:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getMyCommissions = getMyCommissions;
// Obter estatísticas de comissões
const getCommissionStats = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const [pending, approved, paid, cancelled] = await Promise.all([
            AffiliateCommission_1.default.count({ where: { affiliateId: affiliate.id, status: "pending" } }),
            AffiliateCommission_1.default.count({ where: { affiliateId: affiliate.id, status: "approved" } }),
            AffiliateCommission_1.default.count({ where: { affiliateId: affiliate.id, status: "paid" } }),
            AffiliateCommission_1.default.count({ where: { affiliateId: affiliate.id, status: "cancelled" } })
        ]);
        const totalEarned = await AffiliateCommission_1.default.sum("commissionAmount", {
            where: { affiliateId: affiliate.id, status: ["approved", "paid"] }
        }) || 0;
        return res.json({
            pending,
            approved,
            paid,
            cancelled,
            totalEarned,
            totalWithdrawn: affiliate.totalWithdrawn,
            availableBalance: totalEarned - affiliate.totalWithdrawn
        });
    }
    catch (error) {
        console.error("Error getting commission stats:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getCommissionStats = getCommissionStats;
// Obter saques do afiliado
const getMyWithdrawals = async (req, res) => {
    try {
        const { companyId } = req.user;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        const withdrawals = await AffiliateWithdrawal_1.default.findAll({
            where: { affiliateId: affiliate.id },
            order: [["createdAt", "DESC"]]
        });
        return res.json(withdrawals);
    }
    catch (error) {
        console.error("Error getting withdrawals:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getMyWithdrawals = getMyWithdrawals;
// Solicitar saque
const requestWithdrawal = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { amount, paymentMethod, paymentDetails } = req.body;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findOne({
            where: { companyId }
        });
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        // Verificar saldo disponível
        const totalEarned = await AffiliateCommission_1.default.sum("commissionAmount", {
            where: { affiliateId: affiliate.id, status: ["approved", "paid"] }
        }) || 0;
        const availableBalance = totalEarned - affiliate.totalWithdrawn;
        if (amount < affiliate.minWithdrawAmount) {
            return res.status(400).json({
                error: `Valor mínimo para saque é R$ ${affiliate.minWithdrawAmount}`
            });
        }
        if (amount > availableBalance) {
            return res.status(400).json({
                error: `Saldo disponível é R$ ${availableBalance}`
            });
        }
        const withdrawal = await AffiliateWithdrawal_1.default.create({
            affiliateId: affiliate.id,
            amount,
            paymentMethod,
            paymentDetails,
            status: "pending"
        });
        return res.status(201).json(withdrawal);
    }
    catch (error) {
        console.error("Error requesting withdrawal:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.requestWithdrawal = requestWithdrawal;
// Estatísticas gerais de afiliados (super admin)
const getAffiliateStats = async (req, res) => {
    try {
        const Affiliate = getAffiliateModel();
        const [total, active, inactive, suspended] = await Promise.all([
            Affiliate.count(),
            Affiliate.count({ where: { status: "active" } }),
            Affiliate.count({ where: { status: "inactive" } }),
            Affiliate.count({ where: { status: "suspended" } })
        ]);
        return res.json({ total, active, inactive, suspended });
    }
    catch (error) {
        console.error("Error getting affiliate stats:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getAffiliateStats = getAffiliateStats;
// Listar todas as comissões (super admin)
const listAllCommissions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const commissions = await AffiliateCommission_1.default.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["createdAt", "DESC"]]
        });
        return res.json({
            commissions: commissions.rows,
            count: commissions.count,
            hasMore: commissions.count > (parseInt(page) * parseInt(limit))
        });
    }
    catch (error) {
        console.error("Error listing all commissions:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.listAllCommissions = listAllCommissions;
// Atualizar comissão (super admin)
const updateCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const commission = await AffiliateCommission_1.default.findByPk(id);
        if (!commission) {
            return res.status(404).json({ error: "Comissão não encontrada" });
        }
        await commission.update({
            status: status || commission.status,
            notes: notes !== undefined ? notes : commission.notes,
            ...(status === "paid" ? { paidAt: new Date() } : {})
        });
        return res.json(commission);
    }
    catch (error) {
        console.error("Error updating commission:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.updateCommission = updateCommission;
// Listar todos os saques (super admin)
const listAllWithdrawals = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const withdrawals = await AffiliateWithdrawal_1.default.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["createdAt", "DESC"]]
        });
        return res.json({
            withdrawals: withdrawals.rows,
            count: withdrawals.count,
            hasMore: withdrawals.count > (parseInt(page) * parseInt(limit))
        });
    }
    catch (error) {
        console.error("Error listing all withdrawals:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.listAllWithdrawals = listAllWithdrawals;
// Estatísticas de saques (super admin)
const getWithdrawalStats = async (req, res) => {
    try {
        const [pending, approved, rejected] = await Promise.all([
            AffiliateWithdrawal_1.default.count({ where: { status: "pending" } }),
            AffiliateWithdrawal_1.default.count({ where: { status: "approved" } }),
            AffiliateWithdrawal_1.default.count({ where: { status: "rejected" } })
        ]);
        const totalAmount = await AffiliateWithdrawal_1.default.sum("amount", {
            where: { status: "approved" }
        }) || 0;
        return res.json({ pending, approved, rejected, totalAmount });
    }
    catch (error) {
        console.error("Error getting withdrawal stats:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.getWithdrawalStats = getWithdrawalStats;
// Processar saque (super admin)
const processWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const withdrawal = await AffiliateWithdrawal_1.default.findByPk(id);
        if (!withdrawal) {
            return res.status(404).json({ error: "Saque não encontrado" });
        }
        const updateData = {
            status: status || withdrawal.status,
            notes: notes !== undefined ? notes : withdrawal.notes,
            processedAt: new Date(),
            processedBy: req.user.id
        };
        if (status === "rejected") {
            updateData.rejectionReason = notes;
        }
        if (status === "approved") {
            // Atualizar totalWithdrawn do afiliado
            const Affiliate = getAffiliateModel();
            const affiliate = await Affiliate.findByPk(withdrawal.affiliateId);
            if (affiliate) {
                await affiliate.update({
                    totalWithdrawn: parseFloat(affiliate.totalWithdrawn || 0) + parseFloat(withdrawal.amount)
                });
            }
        }
        await withdrawal.update(updateData);
        return res.json(withdrawal);
    }
    catch (error) {
        console.error("Error processing withdrawal:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.processWithdrawal = processWithdrawal;
// Atualizar afiliado (super admin)
const updateAffiliate = async (req, res) => {
    try {
        const { id } = req.params;
        const { commissionRate, minWithdrawAmount, status } = req.body;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        await affiliate.update({
            commissionRate: commissionRate || affiliate.commissionRate,
            minWithdrawAmount: minWithdrawAmount || affiliate.minWithdrawAmount,
            status: status || affiliate.status
        });
        return res.json(affiliate);
    }
    catch (error) {
        console.error("Error updating affiliate:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.updateAffiliate = updateAffiliate;
// Deletar afiliado (super admin)
const deleteAffiliate = async (req, res) => {
    try {
        const { id } = req.params;
        const Affiliate = getAffiliateModel();
        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) {
            return res.status(404).json({ error: "Afiliado não encontrado" });
        }
        await affiliate.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting affiliate:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};
exports.deleteAffiliate = deleteAffiliate;
