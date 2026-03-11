"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferBetweenConnections = exports.cleanupAll = exports.closeAll = exports.remove = exports.update = exports.showFromUUID = exports.showLog = exports.show = exports.setunredmsg = exports.store = exports.kanban = exports.report = exports.index = void 0;
const sequelize_1 = require("sequelize");
const socket_1 = require("../libs/socket");
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const CreateTicketService_1 = __importDefault(require("../services/TicketServices/CreateTicketService"));
const DeleteTicketService_1 = __importDefault(require("../services/TicketServices/DeleteTicketService"));
const ListTicketsService_1 = __importDefault(require("../services/TicketServices/ListTicketsService"));
const ShowTicketFromUUIDService_1 = __importDefault(require("../services/TicketServices/ShowTicketFromUUIDService"));
const ShowTicketService_1 = __importDefault(require("../services/TicketServices/ShowTicketService"));
const UpdateTicketService_1 = __importDefault(require("../services/TicketServices/UpdateTicketService"));
const ListTicketsServiceKanban_1 = __importDefault(require("../services/TicketServices/ListTicketsServiceKanban"));
const CleanupCompanyTicketsService_1 = __importDefault(require("../services/TicketServices/CleanupCompanyTicketsService"));
const CreateLogTicketService_1 = __importDefault(require("../services/TicketServices/CreateLogTicketService"));
const ShowLogTicketService_1 = __importDefault(require("../services/TicketServices/ShowLogTicketService"));
const ListTicketsServiceReport_1 = __importDefault(require("../services/TicketServices/ListTicketsServiceReport"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsRead"));
const SetTicketMessagesAsUnRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsUnRead"));
const async_mutex_1 = require("async-mutex");
const index = async (req, res) => {
    const { pageNumber, status, date, dateStart, dateEnd, updatedAt, searchParam, showAll, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, withUnreadMessages, whatsappIds: whatsappIdsStringified, statusFilter: statusStringfied, sortTickets, searchOnMessages } = req.query;
    const userId = Number(req.user.id);
    const { companyId } = req.user;
    let queueIds = [];
    let tagsIds = [];
    let usersIds = [];
    let whatsappIds = [];
    let statusFilters = [];
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    if (whatsappIdsStringified) {
        whatsappIds = JSON.parse(whatsappIdsStringified);
        console.log("📡 Controller recebeu whatsappIds:", whatsappIds);
    }
    if (statusStringfied) {
        try {
            const parsed = JSON.parse(statusStringfied);
            if (Array.isArray(parsed)) {
                statusFilters = parsed.filter((item) => typeof item === "string" && item.trim().length > 0);
            }
            else if (typeof parsed === "string" && parsed.trim().length > 0) {
                statusFilters = [parsed.trim()];
            }
            else {
                statusFilters = [];
            }
        }
        catch (error) {
            console.error("⚠️ Não foi possível parsear statusFilter:", statusStringfied, error);
            statusFilters = [];
        }
    }
    const { tickets, count, hasMore } = await (0, ListTicketsService_1.default)({
        searchParam,
        tags: tagsIds,
        users: usersIds,
        pageNumber,
        status,
        date,
        dateStart,
        dateEnd,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        whatsappIds,
        statusFilters,
        companyId,
        sortTickets,
        searchOnMessages
    });
    return res.status(200).json({ tickets, count, hasMore });
};
exports.index = index;
const report = async (req, res) => {
    const { searchParam, contactId, whatsappId: whatsappIdsStringified, dateFrom, dateTo, status: statusStringified, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, page: pageNumber, pageSize, onlyRated } = req.query;
    const userId = req.user.id;
    const { companyId } = req.user;
    let queueIds = [];
    let whatsappIds = [];
    let tagsIds = [];
    let usersIds = [];
    let statusIds = [];
    if (statusStringified) {
        statusIds = JSON.parse(statusStringified);
    }
    if (whatsappIdsStringified) {
        whatsappIds = JSON.parse(whatsappIdsStringified);
    }
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    const { tickets, totalTickets } = await (0, ListTicketsServiceReport_1.default)(companyId, {
        searchParam,
        queueIds,
        tags: tagsIds,
        users: usersIds,
        status: statusIds,
        dateFrom,
        dateTo,
        userId,
        contactId,
        whatsappId: whatsappIds,
        onlyRated: onlyRated
    }, +pageNumber, +pageSize);
    return res.status(200).json({ tickets, totalTickets });
};
exports.report = report;
const kanban = async (req, res) => {
    const { pageNumber, status, date, dateStart, dateEnd, updatedAt, searchParam, showAll, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, withUnreadMessages } = req.query;
    const userId = req.user.id;
    const { companyId } = req.user;
    let queueIds = [];
    let tagsIds = [];
    let usersIds = [];
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    const { tickets, count, hasMore } = await (0, ListTicketsServiceKanban_1.default)({
        searchParam,
        tags: tagsIds,
        users: usersIds,
        pageNumber,
        status,
        date,
        dateStart,
        dateEnd,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        companyId
    });
    return res.status(200).json({ tickets, count, hasMore });
};
exports.kanban = kanban;
const store = async (req, res) => {
    const { contactId, status, userId, queueId, whatsappId, reuseOpenTicket } = req.body;
    const { companyId } = req.user;
    // Por defecto true: permitir enviar mensaje aunque haya ticket abierto (mensaje rápido)
    const allowReuse = reuseOpenTicket === false || reuseOpenTicket === "false" ? false : true;
    const ticket = await (0, CreateTicketService_1.default)({
        contactId,
        status,
        userId,
        companyId,
        queueId,
        whatsappId,
        reuseOpenTicket: allowReuse
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        // .to(ticket.status)
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
    });
    return res.status(200).json(ticket);
};
exports.store = store;
const setunredmsg = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const ticket = await (0, ShowTicketService_1.default)(ticketId, companyId, userId);
    if (ticket.channel === "whatsapp" && ticket.whatsappId) {
        (0, SetTicketMessagesAsUnRead_1.default)(ticket);
    }
    return res.status(200).json(ticket);
};
exports.setunredmsg = setunredmsg;
const show = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const contact = await (0, ShowTicketService_1.default)(ticketId, companyId, userId);
    await (0, CreateLogTicketService_1.default)({
        userId,
        ticketId,
        type: "access"
    });
    return res.status(200).json(contact);
};
exports.show = show;
const showLog = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const log = await (0, ShowLogTicketService_1.default)({ ticketId, companyId });
    return res.status(200).json(log);
};
exports.showLog = showLog;
const showFromUUID = async (req, res) => {
    const { uuid } = req.params;
    const { id: userId, companyId } = req.user;
    const ticket = await (0, ShowTicketFromUUIDService_1.default)(uuid, companyId);
    if (ticket.channel === "whatsapp" && ticket.whatsappId && ticket.unreadMessages > 0) {
        try {
            await (0, SetTicketMessagesAsRead_1.default)(ticket);
        }
        catch (err) {
            console.warn("[showFromUUID] SetTicketMessagesAsRead:", err);
        }
    }
    await (0, CreateLogTicketService_1.default)({
        userId,
        ticketId: ticket.id,
        type: "access"
    });
    return res.status(200).json(ticket);
};
exports.showFromUUID = showFromUUID;
const update = async (req, res) => {
    const { ticketId } = req.params;
    const ticketData = req.body;
    const { companyId } = req.user;
    const mutex = new async_mutex_1.Mutex();
    const result = await mutex.runExclusive(async () => {
        const ticketResult = await (0, UpdateTicketService_1.default)({
            ticketData,
            ticketId,
            companyId
        });
        return ticketResult;
    });
    const { ticket } = result || {};
    return res.status(200).json(ticket);
};
exports.update = update;
const remove = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    // await ShowTicketService(ticketId, companyId);
    const ticket = await (0, DeleteTicketService_1.default)(ticketId, userId, companyId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        // .to(ticket.status)
        // .to(ticketId)
        // .to("notification")
        .emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticketId: +ticketId
    });
    return res.status(200).json({ message: "ticket deleted" });
};
exports.remove = remove;
const closeAll = async (req, res) => {
    const { companyId } = req.user;
    const { status } = req.body;
    const io = (0, socket_1.getIO)();
    const { rows: tickets } = await Ticket_1.default.findAndCountAll({
        where: { companyId: companyId, status: status },
        order: [["updatedAt", "DESC"]]
    });
    tickets.forEach(async (ticket) => {
        const ticketData = {
            status: "closed",
            userId: ticket.userId || null,
            queueId: ticket.queueId || null,
            unreadMessages: 0,
            amountUsedBotQueues: 0,
            sendFarewellMessage: false
        };
        await (0, UpdateTicketService_1.default)({ ticketData, ticketId: ticket.id, companyId });
    });
    return res.status(200).json();
};
exports.closeAll = closeAll;
const cleanupAll = async (req, res) => {
    const { companyId } = req.user;
    await (0, CleanupCompanyTicketsService_1.default)({ companyId });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
        action: "cleanup"
    });
    return res.status(200).json({ message: "All tickets for this company have been deleted" });
};
exports.cleanupAll = cleanupAll;
const transferBetweenConnections = async (req, res) => {
    const { companyId } = req.user;
    const { sourceWhatsappId, destinationWhatsappId } = req.body;
    if (!sourceWhatsappId || !destinationWhatsappId) {
        return res.status(400).json({ error: "sourceWhatsappId and destinationWhatsappId are required" });
    }
    if (sourceWhatsappId === destinationWhatsappId) {
        return res.status(400).json({ error: "Source and destination must be different" });
    }
    const [sourceWhatsapp, destWhatsapp] = await Promise.all([
        Whatsapp_1.default.findOne({ where: { id: sourceWhatsappId, companyId } }),
        Whatsapp_1.default.findOne({ where: { id: destinationWhatsappId, companyId } })
    ]);
    if (!sourceWhatsapp || !destWhatsapp) {
        return res.status(404).json({ error: "One or both connections not found or not in your company" });
    }
    const [updatedCount] = await Ticket_1.default.update({ whatsappId: destinationWhatsappId }, {
        where: {
            companyId,
            whatsappId: sourceWhatsappId,
            status: { [sequelize_1.Op.ne]: "closed" }
        }
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
        action: "refresh"
    });
    return res.status(200).json({
        message: "Tickets transferred successfully",
        transferredCount: updatedCount
    });
};
exports.transferBetweenConnections = transferBetweenConnections;
