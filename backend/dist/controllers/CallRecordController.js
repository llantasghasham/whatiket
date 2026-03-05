"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.show = exports.index = exports.update = exports.store = void 0;
const sequelize_1 = require("sequelize");
const CallRecord_1 = __importDefault(require("../models/CallRecord"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const User_1 = __importDefault(require("../models/User"));
const store = async (req, res) => {
    const { companyId, id: userId } = req.user;
    const { contactId, whatsappId, ticketId, toNumber } = req.body;
    try {
        const callRecord = await CallRecord_1.default.create({
            callId: `out-${Date.now()}`,
            type: "outgoing",
            status: "answered",
            fromNumber: "",
            toNumber: toNumber || "",
            duration: 0,
            contactId: contactId || null,
            whatsappId: whatsappId || null,
            ticketId: ticketId || null,
            userId,
            companyId,
            callStartedAt: new Date(),
        });
        return res.status(201).json(callRecord);
    }
    catch (err) {
        return res.status(500).json({ error: "Erro ao registrar chamada" });
    }
};
exports.store = store;
const update = async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { status, duration } = req.body;
    try {
        const record = await CallRecord_1.default.findOne({ where: { id, companyId } });
        if (!record)
            return res.status(404).json({ error: "Registro não encontrado" });
        await record.update({
            status: status || record.status,
            duration: duration || record.duration,
            callEndedAt: new Date(),
        });
        return res.json(record);
    }
    catch (err) {
        return res.status(500).json({ error: "Erro ao atualizar chamada" });
    }
};
exports.update = update;
const index = async (req, res) => {
    const { companyId, id: userId, profile } = req.user;
    const { pageNumber = "1", status, dateStart, dateEnd, contactNumber, whatsappId } = req.query;
    const limit = 40;
    const offset = limit * (Number(pageNumber) - 1);
    const where = { companyId };
    // Usuário comum só vê suas próprias chamadas
    if (profile !== "admin") {
        where.userId = userId;
    }
    if (status) {
        where.status = status;
    }
    if (dateStart && dateEnd) {
        where.createdAt = {
            [sequelize_1.Op.between]: [new Date(`${dateStart}T00:00:00`), new Date(`${dateEnd}T23:59:59`)]
        };
    }
    else if (dateStart) {
        where.createdAt = {
            [sequelize_1.Op.gte]: new Date(`${dateStart}T00:00:00`)
        };
    }
    if (contactNumber) {
        where.fromNumber = { [sequelize_1.Op.like]: `%${contactNumber}%` };
    }
    if (whatsappId) {
        where.whatsappId = Number(whatsappId);
    }
    // Não mostrar registros com status "ringing" (chamadas em andamento)
    if (!status) {
        where.status = { [sequelize_1.Op.ne]: "ringing" };
    }
    const { count, rows: records } = await CallRecord_1.default.findAndCountAll({
        where,
        include: [
            {
                model: Contact_1.default,
                as: "contact",
                attributes: ["id", "name", "number", "profilePicUrl"]
            },
            {
                model: Whatsapp_1.default,
                as: "whatsapp",
                attributes: ["id", "name"]
            },
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name"]
            }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });
    const hasMore = count > offset + records.length;
    return res.json({ records, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const record = await CallRecord_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: Contact_1.default,
                as: "contact",
                attributes: ["id", "name", "number", "profilePicUrl"]
            },
            {
                model: Whatsapp_1.default,
                as: "whatsapp",
                attributes: ["id", "name"]
            },
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name"]
            }
        ]
    });
    if (!record) {
        return res.status(404).json({ error: "Call record not found" });
    }
    return res.json(record);
};
exports.show = show;
const summary = async (req, res) => {
    const { companyId, id: userId, profile } = req.user;
    const { dateStart, dateEnd } = req.query;
    const where = {
        companyId,
        status: { [sequelize_1.Op.ne]: "ringing" }
    };
    // Usuário comum só vê resumo das suas próprias chamadas
    if (profile !== "admin") {
        where.userId = userId;
    }
    if (dateStart && dateEnd) {
        where.createdAt = {
            [sequelize_1.Op.between]: [new Date(`${dateStart}T00:00:00`), new Date(`${dateEnd}T23:59:59`)]
        };
    }
    const total = await CallRecord_1.default.count({ where });
    const answered = await CallRecord_1.default.count({ where: { ...where, status: "answered" } });
    const missed = await CallRecord_1.default.count({ where: { ...where, status: "missed" } });
    const busy = await CallRecord_1.default.count({ where: { ...where, status: "busy" } });
    return res.json({ total, answered, missed, busy });
};
exports.summary = summary;
