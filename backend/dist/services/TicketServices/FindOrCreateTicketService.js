"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowTicketService_1 = __importDefault(require("./ShowTicketService"));
const lodash_1 = require("lodash");
const socket_1 = require("../../libs/socket");
const logger_1 = __importDefault(require("../../utils/logger"));
const CreateLogTicketService_1 = __importDefault(require("./CreateLogTicketService"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const resolveLeadClientForContact_1 = __importDefault(require("./helpers/resolveLeadClientForContact"));
const ContactDeduplicationService_1 = require("../ContactServices/ContactDeduplicationService");
// interface Response {
//   ticket: Ticket;
//   // isCreated: boolean;
// }
const FindOrCreateTicketService = async (contact, whatsapp, unreadMessages, companyId, queueId = null, userId = null, groupContact, channel, isImported, isForward, settings, isTransfered, isCampaign = false) => {
    // try {
    // let isCreated = false;
    let openAsLGPD = false;
    if (settings.enableLGPD) {
        //adicionar lgpdMessage
        openAsLGPD =
            !isCampaign &&
                !isTransfered &&
                settings.enableLGPD === "enabled" &&
                settings.lgpdMessage !== "" &&
                (settings.lgpdConsent === "enabled" ||
                    (settings.lgpdConsent === "disabled" &&
                        (0, lodash_1.isNil)(contact?.lgpdAcceptedAt)));
    }
    const io = (0, socket_1.getIO)();
    // 🔍 Verificar se contato tem duplicado mais adequado antes de criar ticket
    const betterContact = await (0, ContactDeduplicationService_1.FindDuplicateContact)({
        number: contact.number,
        lid: contact.lid,
        remoteJid: contact.remoteJid,
        companyId,
        excludeId: contact.id
    });
    if (betterContact && betterContact.id !== contact.id) {
        logger_1.default.info(`Using better contact for ticket: ${betterContact.id} instead of ${contact.id}`);
        contact = betterContact;
    }
    const DirectTicketsToWallets = settings.DirectTicketsToWallets;
    const baseContactId = groupContact ? groupContact.id : contact.id;
    const { leadId, clientId } = await (0, resolveLeadClientForContact_1.default)(baseContactId, companyId);
    // 🔍 BUSCA INTELIGENTE DE TICKETS (RESOLVE @lid)
    let ticket = null;
    // 1️⃣ Busca principal por contactId
    ticket = await Ticket_1.default.findOne({
        where: {
            status: {
                [sequelize_1.Op.or]: ["open", "pending", "group", "nps", "lgpd"]
            },
            contactId: baseContactId,
            companyId,
            whatsappId: whatsapp.id
        },
        order: [["id", "DESC"]]
    });
    // 2️⃣ Se não encontrou E contato tem LID, busca por LID
    if (!ticket && contact.lid) {
        logger_1.default.info(`🔍 Buscando ticket por LID: ${contact.lid}`);
        // Buscar outros contatos com mesmo LID
        const contactsWithSameLid = await Contact_1.default.findAll({
            where: {
                lid: contact.lid,
                companyId,
                id: { [sequelize_1.Op.ne]: contact.id } // Excluir contato atual
            }
        });
        // Para cada contato com mesmo LID, buscar tickets
        for (const lidContact of contactsWithSameLid) {
            const lidTicket = await Ticket_1.default.findOne({
                where: {
                    status: {
                        [sequelize_1.Op.or]: ["open", "pending", "group", "nps", "lgpd"]
                    },
                    contactId: lidContact.id,
                    companyId,
                    whatsappId: whatsapp.id
                },
                order: [["id", "DESC"]]
            });
            if (lidTicket) {
                logger_1.default.info(`✅ Ticket encontrado por LID: ${lidTicket.id} (contactId: ${lidContact.id})`);
                ticket = lidTicket;
                // 🔄 ATUALIZAR TICKET para usar o contato correto
                await ticket.update({
                    contactId: baseContactId // Usa o contactId correto
                });
                break; // Encontrou, para de buscar
            }
        }
    }
    // 3️⃣ Se ainda não encontrou, busca por remoteJid (contatos @lid)
    if (!ticket && contact.remoteJid && contact.remoteJid.includes("@lid")) {
        logger_1.default.info(`🔍 Buscando ticket por remoteJid @lid: ${contact.remoteJid}`);
        const lidDigits = contact.remoteJid.split("@")[0];
        const contactsByRemoteJid = await Contact_1.default.findAll({
            where: {
                remoteJid: { [sequelize_1.Op.like]: `%${lidDigits}@%` },
                companyId,
                id: { [sequelize_1.Op.ne]: contact.id }
            }
        });
        for (const remoteJidContact of contactsByRemoteJid) {
            const remoteJidTicket = await Ticket_1.default.findOne({
                where: {
                    status: {
                        [sequelize_1.Op.or]: ["open", "pending", "group", "nps", "lgpd"]
                    },
                    contactId: remoteJidContact.id,
                    companyId,
                    whatsappId: whatsapp.id
                },
                order: [["id", "DESC"]]
            });
            if (remoteJidTicket) {
                logger_1.default.info(`✅ Ticket encontrado por remoteJid: ${remoteJidTicket.id} (contactId: ${remoteJidContact.id})`);
                ticket = remoteJidTicket;
                // 🔄 ATUALIZAR TICKET para usar o contato correto
                await ticket.update({
                    contactId: baseContactId
                });
                break;
            }
        }
    }
    if (ticket) {
        if (isCampaign) {
            await ticket.update({
                userId: userId !== ticket.userId ? ticket.userId : userId,
                queueId: queueId !== ticket.queueId ? ticket.queueId : queueId
            });
        }
        else {
            await ticket.update({
                unreadMessages,
                isBot: false,
                crmLeadId: leadId ?? ticket.crmLeadId,
                crmClientId: clientId ?? ticket.crmClientId
            });
        }
        ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
        // console.log(ticket.id)
        if (!isCampaign && !isForward) {
            // @ts-ignore: Unreachable code error
            if ((Number(ticket?.userId) !== Number(userId) &&
                Number(userId) !== 0 &&
                !(0, lodash_1.isNil)(userId) &&
                !ticket.isGroup) ||
                // @ts-ignore: Unreachable code error
                (Number(ticket?.queueId) !== Number(queueId) &&
                    Number(queueId) !== 0 &&
                    !(0, lodash_1.isNil)(queueId))) {
                throw new AppError_1.default(`Ticket em outro atendimento. ${"Atendente: " + ticket?.user?.name} - ${"Fila: " + ticket?.queue?.name}`);
            }
        }
        // isCreated = true;
        return ticket;
    }
    // REAPROVEITA SEMPRE O TICKET MAIS RECENTE (EVITA DUPLICAR CONVERSAS)
    const shouldOpenAsLGPD = !isImported &&
        !(0, lodash_1.isNil)(settings.enableLGPD) &&
        openAsLGPD &&
        !groupContact;
    const defaultStatus = shouldOpenAsLGPD
        ? "lgpd"
        : whatsapp.groupAsTicket === "enabled" || !groupContact
            ? "pending"
            : "group";
    const ticketData = {
        contactId: baseContactId,
        status: defaultStatus,
        isGroup: !!groupContact,
        unreadMessages,
        whatsappId: whatsapp.id,
        companyId,
        isBot: groupContact ? false : true,
        channel,
        imported: isImported ? new Date() : null,
        isActiveDemand: false,
        crmLeadId: leadId,
        crmClientId: clientId
    };
    if (DirectTicketsToWallets && contact.id) {
        const wallet = contact;
        const wallets = await wallet.getWallets();
        if (wallets && wallets[0]?.id) {
            ticketData.status = shouldOpenAsLGPD
                ? "lgpd"
                : whatsapp.groupAsTicket === "enabled" || !groupContact
                    ? "open"
                    : "group";
            ticketData.userId = wallets[0].id;
        }
    }
    let reusedTicket = false;
    if (!ticket) {
        // Reabertura de ticket quando não há nenhum aberto
        // Para Facebook/Instagram, não dependemos de whatsappId, usamos channel
        const baseWhere = {
            contactId: contact.id,
            companyId
        };
        if (channel === "facebook" || channel === "instagram") {
            baseWhere.channel = channel;
        }
        else {
            baseWhere.whatsappId = whatsapp.id;
        }
        ticket = await Ticket_1.default.findOne({
            where: baseWhere,
            order: [["updatedAt", "DESC"]]
        });
        if (ticket && ["closed", "nps", "lgpd"].includes(ticket.status)) {
            const reopenData = {
                status: "pending",
                unreadMessages,
                companyId,
                isBot: false,
                crmLeadId: leadId ?? ticket.crmLeadId,
                crmClientId: clientId ?? ticket.crmClientId
            };
            // Tratar queueId = 0 como "sem fila" para não violar FK
            if (queueId != 0 && !(0, lodash_1.isNil)(queueId)) {
                reopenData.queueId = queueId;
            }
            // Tratar userId = 0 como "sem usuário" para não violar FK
            if (userId != 0 && !(0, lodash_1.isNil)(userId)) {
                reopenData.userId = userId;
            }
            await ticket.update(reopenData);
            await ticket.reload();
            reusedTicket = true;
        }
    }
    if (!ticket) {
        ticket = await Ticket_1.default.findOne({
            where: {
                contactId: baseContactId,
                companyId
            },
            order: [["updatedAt", "DESC"]]
        });
        if (ticket) {
            const reopenData = {
                ...ticketData,
                status: ticketData.status === "group" && !ticket.isGroup ? "pending" : ticketData.status,
                isBot: groupContact ? false : false
            };
            if (!(0, lodash_1.isNil)(queueId)) {
                reopenData.queueId = queueId;
            }
            if (!(0, lodash_1.isNil)(userId)) {
                reopenData.userId = userId;
            }
            await ticket.update(reopenData);
            await ticket.reload();
            reusedTicket = true;
        }
    }
    if (!ticket) {
        console.log("Criando ticket", ticketData);
        ticket = await Ticket_1.default.create(ticketData);
        // await FindOrCreateATicketTrakingService({
        //   ticketId: ticket.id,
        //   companyId,
        //   whatsappId: whatsapp.id,
        //   userId: userId ? userId : ticket.userId
        // });
    }
    if (queueId != 0 && !(0, lodash_1.isNil)(queueId)) {
        //Determina qual a fila esse ticket pertence.
        await ticket.update({ queueId: queueId });
    }
    if (userId != 0 && !(0, lodash_1.isNil)(userId)) {
        //Determina qual a fila esse ticket pertence.
        await ticket.update({ userId: userId });
    }
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    await (0, CreateLogTicketService_1.default)({
        ticketId: ticket.id,
        type: shouldOpenAsLGPD ? "lgpd" : reusedTicket ? "reopen" : "create"
    });
    return ticket;
};
exports.default = FindOrCreateTicketService;
