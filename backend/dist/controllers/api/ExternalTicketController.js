"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = exports.reopen = exports.close = exports.update = exports.messages = exports.show = exports.index = void 0;
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const User_1 = __importDefault(require("../../models/User"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const Message_1 = __importDefault(require("../../models/Message"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const serializeTicket = (ticket) => ({
    id: ticket.id,
    uuid: ticket.uuid,
    status: ticket.status,
    channel: ticket.channel,
    lastMessage: ticket.lastMessage,
    isGroup: ticket.isGroup,
    unreadMessages: ticket.unreadMessages,
    contactId: ticket.contactId,
    contact: ticket.contact ? {
        id: ticket.contact.id,
        name: ticket.contact.name,
        number: ticket.contact.number,
        email: ticket.contact.email,
        profilePicUrl: ticket.contact.profilePicUrl
    } : null,
    userId: ticket.userId,
    user: ticket.user ? {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email
    } : null,
    queueId: ticket.queueId,
    queue: ticket.queue ? {
        id: ticket.queue.id,
        name: ticket.queue.name,
        color: ticket.queue.color
    } : null,
    whatsappId: ticket.whatsappId,
    whatsapp: ticket.whatsapp ? {
        id: ticket.whatsapp.id,
        name: ticket.whatsapp.name
    } : null,
    tags: ticket.tags?.map(t => ({ id: t.id, name: t.name, color: t.color })) || [],
    isBot: ticket.isBot,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt
});
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, status, queueId, userId, contactId, whatsappId, isGroup, searchParam, startDate, endDate } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId };
    if (status) {
        whereCondition.status = status;
    }
    if (queueId) {
        whereCondition.queueId = Number(queueId);
    }
    if (userId) {
        whereCondition.userId = Number(userId);
    }
    if (contactId) {
        whereCondition.contactId = Number(contactId);
    }
    if (whatsappId) {
        whereCondition.whatsappId = Number(whatsappId);
    }
    if (isGroup !== undefined) {
        whereCondition.isGroup = isGroup === "true";
    }
    if (startDate && endDate) {
        whereCondition.createdAt = {
            [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }
    else if (startDate) {
        whereCondition.createdAt = {
            [sequelize_1.Op.gte]: new Date(startDate)
        };
    }
    else if (endDate) {
        whereCondition.createdAt = {
            [sequelize_1.Op.lte]: new Date(endDate)
        };
    }
    const includeCondition = [
        {
            model: Contact_1.default,
            as: "contact",
            attributes: ["id", "name", "number", "email", "profilePicUrl"]
        },
        {
            model: User_1.default,
            as: "user",
            attributes: ["id", "name", "email"]
        },
        {
            model: Queue_1.default,
            as: "queue",
            attributes: ["id", "name", "color"]
        },
        {
            model: Whatsapp_1.default,
            as: "whatsapp",
            attributes: ["id", "name"]
        },
        {
            model: Tag_1.default,
            as: "tags",
            attributes: ["id", "name", "color"],
            through: { attributes: [] }
        }
    ];
    // Filtrar por nome/número do contato
    if (searchParam) {
        includeCondition[0].where = {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
                { number: { [sequelize_1.Op.iLike]: `%${searchParam}%` } }
            ]
        };
        includeCondition[0].required = true;
    }
    const { count, rows: tickets } = await Ticket_1.default.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        order: [["updatedAt", "DESC"]],
        limit,
        offset
    });
    const hasMore = count > offset + tickets.length;
    return res.json({
        tickets: tickets.map(serializeTicket),
        count,
        hasMore
    });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: Contact_1.default,
                as: "contact",
                attributes: ["id", "name", "number", "email", "profilePicUrl"]
            },
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name", "email"]
            },
            {
                model: Queue_1.default,
                as: "queue",
                attributes: ["id", "name", "color"]
            },
            {
                model: Whatsapp_1.default,
                as: "whatsapp",
                attributes: ["id", "name"]
            },
            {
                model: Tag_1.default,
                as: "tags",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ]
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    return res.json(serializeTicket(ticket));
};
exports.show = show;
const messages = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const { pageNumber } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    const { count, rows: messagesList } = await Message_1.default.findAndCountAll({
        where: { ticketId: ticket.id },
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });
    const hasMore = count > offset + messagesList.length;
    return res.json({
        messages: messagesList.map(m => ({
            id: m.id,
            body: m.body,
            read: m.read,
            mediaType: m.mediaType,
            mediaUrl: m.mediaUrl,
            fromMe: m.fromMe,
            isDeleted: m.isDeleted,
            createdAt: m.createdAt
        })),
        count,
        hasMore
    });
};
exports.messages = messages;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { status, userId, queueId, tagIds } = req.body;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    const updateData = {};
    if (status !== undefined) {
        const validStatuses = ["open", "pending", "closed"];
        if (!validStatuses.includes(status)) {
            throw new AppError_1.default("ERR_INVALID_STATUS", 400);
        }
        updateData.status = status;
    }
    if (userId !== undefined) {
        if (userId === null) {
            updateData.userId = null;
        }
        else {
            const user = await User_1.default.findOne({
                where: { id: userId, companyId: externalAuth.companyId }
            });
            if (!user) {
                throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
            }
            updateData.userId = userId;
        }
    }
    if (queueId !== undefined) {
        if (queueId === null) {
            updateData.queueId = null;
        }
        else {
            const queue = await Queue_1.default.findOne({
                where: { id: queueId, companyId: externalAuth.companyId }
            });
            if (!queue) {
                throw new AppError_1.default("ERR_QUEUE_NOT_FOUND", 404);
            }
            updateData.queueId = queueId;
        }
    }
    await ticket.update(updateData);
    // Atualizar tags se fornecido
    if (tagIds !== undefined && Array.isArray(tagIds)) {
        await TicketTag_1.default.destroy({ where: { ticketId: ticket.id } });
        for (const tagId of tagIds) {
            await TicketTag_1.default.create({
                ticketId: ticket.id,
                tagId
            });
        }
    }
    await ticket.reload({
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
            { model: User_1.default, as: "user", attributes: ["id", "name", "email"] },
            { model: Queue_1.default, as: "queue", attributes: ["id", "name", "color"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "name"] },
            { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "ticket.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            ticket: serializeTicket(ticket)
        }
    });
    return res.json(serializeTicket(ticket));
};
exports.update = update;
const close = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    await ticket.update({ status: "closed" });
    await ticket.reload({
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
            { model: User_1.default, as: "user", attributes: ["id", "name", "email"] },
            { model: Queue_1.default, as: "queue", attributes: ["id", "name", "color"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "name"] },
            { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "ticket.closed",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            ticket: serializeTicket(ticket)
        }
    });
    return res.json(serializeTicket(ticket));
};
exports.close = close;
const reopen = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    await ticket.update({ status: "open" });
    await ticket.reload({
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
            { model: User_1.default, as: "user", attributes: ["id", "name", "email"] },
            { model: Queue_1.default, as: "queue", attributes: ["id", "name", "color"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "name"] },
            { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "ticket.reopened",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            ticket: serializeTicket(ticket)
        }
    });
    return res.json(serializeTicket(ticket));
};
exports.reopen = reopen;
const transfer = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { userId, queueId } = req.body;
    const ticket = await Ticket_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_TICKET_NOT_FOUND", 404);
    }
    const updateData = { status: "pending" };
    if (userId) {
        const user = await User_1.default.findOne({
            where: { id: userId, companyId: externalAuth.companyId }
        });
        if (!user) {
            throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
        }
        updateData.userId = userId;
        updateData.status = "open";
    }
    if (queueId) {
        const queue = await Queue_1.default.findOne({
            where: { id: queueId, companyId: externalAuth.companyId }
        });
        if (!queue) {
            throw new AppError_1.default("ERR_QUEUE_NOT_FOUND", 404);
        }
        updateData.queueId = queueId;
    }
    await ticket.update(updateData);
    await ticket.reload({
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number", "email", "profilePicUrl"] },
            { model: User_1.default, as: "user", attributes: ["id", "name", "email"] },
            { model: Queue_1.default, as: "queue", attributes: ["id", "name", "color"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "name"] },
            { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "ticket.transferred",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            ticket: serializeTicket(ticket)
        }
    });
    return res.json(serializeTicket(ticket));
};
exports.transfer = transfer;
