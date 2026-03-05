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
exports.DashTicketsQueues = exports.reportsDay = exports.reportsUsers = exports.charts = exports.index = void 0;
const sequelize_1 = require("sequelize");
const DashbardDataService_1 = __importDefault(require("../services/ReportService/DashbardDataService"));
const TicketsAttendance_1 = require("../services/ReportService/TicketsAttendance");
const TicketsDayService_1 = require("../services/ReportService/TicketsDayService");
const TicketsQueuesService_1 = __importDefault(require("../services/TicketServices/TicketsQueuesService"));
const Tag_1 = __importDefault(require("../models/Tag"));
const TicketTag_1 = __importDefault(require("../models/TicketTag"));
const ContactTag_1 = __importDefault(require("../models/ContactTag"));
const index = async (req, res) => {
    const params = req.query;
    const { companyId } = req.user;
    let daysInterval = 3;
    const dashboardData = await (0, DashbardDataService_1.default)(companyId, params);
    // ==============================
    // Métricas adicionais: Tags e Kanban
    // ==============================
    try {
        // Total de tags da empresa
        const totalTags = await Tag_1.default.count({ where: { companyId } });
        // Tags configuradas como Kanban, com contagem de tickets por tag
        const kanbanTags = await Tag_1.default.findAll({
            where: { companyId, kanban: 1 },
            include: [
                {
                    model: TicketTag_1.default,
                    as: "ticketTags",
                    attributes: []
                }
            ],
            attributes: [
                "id",
                "name",
                "color",
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("ticketTags.ticketId")), "ticketsCount"]
            ],
            group: ["Tag.id"],
            order: [["id", "ASC"]]
        });
        const kanbanSummary = kanbanTags.map(tag => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            ticketsCount: Number(tag.get("ticketsCount") || 0)
        }));
        const tagsSummary = {
            totalTags,
            totalKanbanTags: kanbanSummary.length
        };
        // Contatos por Tag (todas as tags, incluindo Kanban)
        const tagsWithContacts = await Tag_1.default.findAll({
            where: { companyId },
            include: [
                {
                    model: ContactTag_1.default,
                    as: "contactTags",
                    attributes: []
                }
            ],
            attributes: [
                "id",
                "name",
                "color",
                "kanban",
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactTags.contactId")), "contactsCount"]
            ],
            group: ["Tag.id"],
            order: [["name", "ASC"]]
        });
        const tagsContactsSummary = tagsWithContacts.map(tag => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            kanban: tag.kanban,
            contactsCount: Number(tag.get("contactsCount") || 0)
        }));
        // Tendência de contatos por Tag (7, 15 e 30 dias)
        const now = new Date();
        const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const date15d = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const contactsByTag7d = await ContactTag_1.default.findAll({
            include: [
                {
                    model: Tag_1.default,
                    as: "tags",
                    where: { companyId },
                    attributes: []
                }
            ],
            attributes: [["tagId", "tagId"], [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactId")), "count7d"]],
            where: {
                createdAt: { [sequelize_1.Op.gte]: date7d }
            },
            group: ["ContactTag.tagId"]
        });
        const contactsByTag15d = await ContactTag_1.default.findAll({
            include: [
                {
                    model: Tag_1.default,
                    as: "tags",
                    where: { companyId },
                    attributes: []
                }
            ],
            attributes: [["tagId", "tagId"], [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactId")), "count15d"]],
            where: {
                createdAt: { [sequelize_1.Op.gte]: date15d }
            },
            group: ["ContactTag.tagId"]
        });
        const contactsByTag30d = await ContactTag_1.default.findAll({
            include: [
                {
                    model: Tag_1.default,
                    as: "tags",
                    where: { companyId },
                    attributes: []
                }
            ],
            attributes: [["tagId", "tagId"], [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactId")), "count30d"]],
            where: {
                createdAt: { [sequelize_1.Op.gte]: date30d }
            },
            group: ["ContactTag.tagId"]
        });
        const trendMap = {};
        contactsByTag7d.forEach((row) => {
            const tagId = row.get("tagId");
            if (!trendMap[tagId])
                trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
            trendMap[tagId].contacts7d = Number(row.get("count7d") || 0);
        });
        contactsByTag15d.forEach((row) => {
            const tagId = row.get("tagId");
            if (!trendMap[tagId])
                trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
            trendMap[tagId].contacts15d = Number(row.get("count15d") || 0);
        });
        contactsByTag30d.forEach((row) => {
            const tagId = row.get("tagId");
            if (!trendMap[tagId])
                trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
            trendMap[tagId].contacts30d = Number(row.get("count30d") || 0);
        });
        const tagsContactsTrend = tagsContactsSummary.map(tag => ({
            ...tag,
            contacts7d: trendMap[tag.id]?.contacts7d || 0,
            contacts15d: trendMap[tag.id]?.contacts15d || 0,
            contacts30d: trendMap[tag.id]?.contacts30d || 0
        }));
        return res.status(200).json({
            ...dashboardData,
            tagsSummary,
            kanbanSummary,
            tagsContactsSummary,
            tagsContactsTrend
        });
    }
    catch (err) {
        // Em caso de erro nas métricas adicionais, ainda retornamos o dashboard básico
        console.error("Erro ao carregar métricas de tags/kanban para o dashboard:", err);
        return res.status(200).json(dashboardData);
    }
};
exports.index = index;
// Mapeamento DDD → Estado brasileiro
const dddToState = {
    "11": "SP", "12": "SP", "13": "SP", "14": "SP", "15": "SP", "16": "SP", "17": "SP", "18": "SP", "19": "SP",
    "21": "RJ", "22": "RJ", "24": "RJ",
    "27": "ES", "28": "ES",
    "31": "MG", "32": "MG", "33": "MG", "34": "MG", "35": "MG", "37": "MG", "38": "MG",
    "41": "PR", "42": "PR", "43": "PR", "44": "PR", "45": "PR", "46": "PR",
    "47": "SC", "48": "SC", "49": "SC",
    "51": "RS", "53": "RS", "54": "RS", "55": "RS",
    "61": "DF",
    "62": "GO", "64": "GO",
    "63": "TO",
    "65": "MT", "66": "MT",
    "67": "MS",
    "68": "AC",
    "69": "RO",
    "71": "BA", "73": "BA", "74": "BA", "75": "BA", "77": "BA",
    "79": "SE",
    "81": "PE", "87": "PE",
    "82": "AL",
    "83": "PB",
    "84": "RN",
    "85": "CE", "88": "CE",
    "86": "PI", "89": "PI",
    "91": "PA", "93": "PA", "94": "PA",
    "92": "AM", "97": "AM",
    "95": "RR",
    "96": "AP",
    "98": "MA", "99": "MA",
};
const charts = async (req, res) => {
    const { companyId } = req.user;
    try {
        const Contact = (await Promise.resolve().then(() => __importStar(require("../models/Contact")))).default;
        // 1. Contatos por mês (últimos 12 meses)
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const contactsByMonth = await Contact.findAll({
            where: {
                companyId,
                createdAt: { [sequelize_1.Op.gte]: twelveMonthsAgo }
            },
            attributes: [
                [(0, sequelize_1.fn)("DATE_TRUNC", "month", (0, sequelize_1.col)("createdAt")), "month"],
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "count"]
            ],
            group: [(0, sequelize_1.fn)("DATE_TRUNC", "month", (0, sequelize_1.col)("createdAt"))],
            order: [[(0, sequelize_1.fn)("DATE_TRUNC", "month", (0, sequelize_1.col)("createdAt")), "ASC"]],
            raw: true
        });
        // Preencher meses sem dados
        const monthsData = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const found = contactsByMonth.find((r) => {
                const rDate = new Date(r.month);
                return rDate.getFullYear() === d.getFullYear() && rDate.getMonth() === d.getMonth();
            });
            monthsData.push({
                month: key,
                label: monthNames[d.getMonth()],
                count: found ? Number(found.count) : 0
            });
        }
        // Total de contatos
        const totalContacts = await Contact.count({ where: { companyId } });
        // Novos contatos este mês
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newContactsThisMonth = await Contact.count({
            where: { companyId, createdAt: { [sequelize_1.Op.gte]: startOfMonth } }
        });
        // Novos contatos mês anterior
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const newContactsPrevMonth = await Contact.count({
            where: {
                companyId,
                createdAt: {
                    [sequelize_1.Op.gte]: startOfPrevMonth,
                    [sequelize_1.Op.lte]: endOfPrevMonth
                }
            }
        });
        // 2. Contatos por Tag (top 5)
        const tagsWithContacts = await Tag_1.default.findAll({
            where: { companyId },
            include: [{ model: ContactTag_1.default, as: "contactTags", attributes: [] }],
            attributes: [
                "id", "name", "color",
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactTags.contactId")), "contactsCount"]
            ],
            group: ["Tag.id"],
            order: [[(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("contactTags.contactId")), "DESC"]],
            limit: 5,
            subQuery: false
        });
        const tagsSummary = tagsWithContacts.map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color || "#3b82f6",
            count: Number(tag.get("contactsCount") || 0)
        }));
        // 3. Contatos por Estado (via DDD do número de telefone)
        const allContacts = await Contact.findAll({
            where: { companyId, isGroup: false },
            attributes: ["number"],
            raw: true
        });
        const stateCount = {};
        allContacts.forEach((c) => {
            if (!c.number)
                return;
            // Número brasileiro: 55 + DDD + número
            let num = c.number.replace(/\D/g, "");
            if (num.startsWith("55") && num.length >= 12) {
                const ddd = num.substring(2, 4);
                const state = dddToState[ddd];
                if (state) {
                    stateCount[state] = (stateCount[state] || 0) + 1;
                }
            }
        });
        const contactsByState = Object.entries(stateCount)
            .map(([state, count]) => ({ state, count }))
            .sort((a, b) => b.count - a.count);
        return res.json({
            contactsByMonth: monthsData,
            totalContacts,
            newContactsThisMonth,
            newContactsPrevMonth,
            tagsSummary,
            contactsByState
        });
    }
    catch (err) {
        console.error("Erro ao carregar dados dos gráficos:", err);
        return res.status(500).json({ error: "Erro ao carregar dados dos gráficos" });
    }
};
exports.charts = charts;
const reportsUsers = async (req, res) => {
    const { initialDate, finalDate, companyId } = req.query;
    const { data } = await (0, TicketsAttendance_1.TicketsAttendance)({ initialDate, finalDate, companyId });
    return res.json({ data });
};
exports.reportsUsers = reportsUsers;
const reportsDay = async (req, res) => {
    const { initialDate, finalDate, companyId } = req.query;
    const { count, data } = await (0, TicketsDayService_1.TicketsDayService)({ initialDate, finalDate, companyId });
    return res.json({ count, data });
};
exports.reportsDay = reportsDay;
const DashTicketsQueues = async (req, res) => {
    const { companyId, profile, id: userId } = req.user;
    const { dateStart, dateEnd, status, queuesIds, showAll } = req.query;
    const tickets = await (0, TicketsQueuesService_1.default)({
        showAll: profile === "admin" ? showAll : false,
        dateStart,
        dateEnd,
        status,
        queuesIds,
        userId,
        companyId,
        profile
    });
    return res.status(200).json(tickets);
};
exports.DashTicketsQueues = DashTicketsQueues;
