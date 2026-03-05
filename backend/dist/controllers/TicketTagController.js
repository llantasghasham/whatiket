"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.store = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const TicketTag_1 = __importDefault(require("../models/TicketTag"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Contact_1 = __importDefault(require("../models/Contact"));
const socket_1 = require("../libs/socket");
const store = async (req, res) => {
    const { ticketId, tagId } = req.params;
    try {
        // Garante que o ticket tenha no máximo UMA tag Kanban
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        const tag = await Tag_1.default.findByPk(tagId);
        if (!tag) {
            throw new AppError_1.default("ERR_NO_TAG_FOUND", 404);
        }
        if (tag.kanban === 1) {
            // Busca todas as tags já vinculadas ao ticket
            // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
            const existingTicketTags = await TicketTag_1.default.findAll({ where: { ticketId } });
            const existingTagIds = existingTicketTags.map(tt => tt.tagId);
            if (existingTagIds.length) {
                // Filtra somente as tags com kanban = 1 entre as já vinculadas
                // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
                const existingKanbanTags = await Tag_1.default.findAll({
                    where: {
                        id: existingTagIds,
                        kanban: 1,
                    },
                });
                const existingKanbanTagIds = existingKanbanTags
                    .map(t => t.id)
                    // evita remover a própria tag que está sendo adicionada
                    .filter(id => String(id) !== String(tagId));
                if (existingKanbanTagIds.length) {
                    // @ts-ignore: Sequelize aceita array em where.tagId
                    await TicketTag_1.default.destroy({ where: { ticketId, tagId: existingKanbanTagIds } });
                }
            }
        }
        // @ts-ignore: Sequelize dynamic method
        const ticketTag = await TicketTag_1.default.create({ ticketId, tagId });
        // Recarrega o ticket com tags e contact.tags para refletir no frontend
        const ticket = await Ticket_1.default.findByPk(ticketId, {
            include: [
                {
                    model: Contact_1.default,
                    as: "contact",
                    attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
                    include: ["extraInfo", "tags"],
                },
                {
                    model: Tag_1.default,
                    as: "tags",
                    attributes: ["id", "name", "color"],
                },
            ],
        });
        if (ticket) {
            const io = (0, socket_1.getIO)();
            io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
                action: "update",
                ticket,
            });
        }
        return res.status(201).json(ticketTag);
    }
    catch (error) {
        console.error("[TicketTagController.store] Error storing ticket tag", {
            ticketId,
            tagId,
            error: error?.message || error,
        });
        return res.status(500).json({
            error: "Failed to store ticket tag.",
            details: error?.message || String(error),
        });
    }
};
exports.store = store;
const remove = async (req, res) => {
    const { ticketId } = req.params;
    try {
        // Remoção manual de TODAS as tags vinculadas ao ticket (inclusive Kanban)
        // @ts-ignore - métodos estáticos do Sequelize são resolvidos em runtime
        await TicketTag_1.default.destroy({ where: { ticketId } });
        // Recarrega o ticket para refletir remoção das tags
        const ticket = await Ticket_1.default.findByPk(ticketId, {
            include: [
                {
                    model: Contact_1.default,
                    as: "contact",
                    attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
                    include: ["extraInfo", "tags"],
                },
                {
                    model: Tag_1.default,
                    as: "tags",
                    attributes: ["id", "name", "color"],
                },
            ],
        });
        if (ticket) {
            const io = (0, socket_1.getIO)();
            io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
                action: "update",
                ticket,
            });
        }
        return res.status(200).json({ message: "Ticket tags removed successfully." });
    }
    catch (error) {
        console.error("[TicketTagController.remove] Error removing ticket tags", {
            ticketId,
            error: error?.message || error,
        });
        return res.status(500).json({
            error: "Failed to remove ticket tags.",
            details: error?.message || String(error),
        });
    }
};
exports.remove = remove;
