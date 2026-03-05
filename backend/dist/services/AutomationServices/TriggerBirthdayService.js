"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBirthdayAutomations = void 0;
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ProcessAutomationService_1 = require("./ProcessAutomationService");
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
// Buscar contatos que fazem aniversário hoje
const getBirthdayContacts = async (companyId) => {
    const today = (0, moment_1.default)();
    const day = today.date();
    const month = today.month() + 1; // moment usa 0-11
    // Buscar contatos com aniversário hoje
    const contacts = await Contact_1.default.findAll({
        where: {
            companyId,
            [sequelize_1.Op.and]: [
                { birthday: { [sequelize_1.Op.ne]: null } }
            ]
        }
    });
    // Filtrar por dia e mês
    return contacts.filter(contact => {
        if (!contact.birthday)
            return false;
        const bday = (0, moment_1.default)(contact.birthday);
        return bday.date() === day && (bday.month() + 1) === month;
    });
};
// Processar automações de aniversário para uma empresa
const processBirthdayAutomations = async (companyId) => {
    try {
        // Buscar automações de aniversário ativas
        const automations = await Automation_1.default.findAll({
            where: {
                companyId,
                triggerType: "birthday",
                isActive: true
            },
            include: [
                {
                    model: AutomationAction_1.default,
                    as: "actions",
                    separate: true,
                    order: [["order", "ASC"]]
                }
            ]
        });
        if (automations.length === 0) {
            return;
        }
        // Buscar contatos aniversariantes
        const contacts = await getBirthdayContacts(companyId);
        if (contacts.length === 0) {
            logger_1.default.info(`[Automation Birthday] Nenhum aniversariante hoje para empresa ${companyId}`);
            return;
        }
        logger_1.default.info(`[Automation Birthday] ${contacts.length} aniversariantes encontrados para empresa ${companyId}`);
        // Buscar WhatsApp padrão
        let whatsapp = null;
        try {
            whatsapp = await (0, GetDefaultWhatsApp_1.default)(companyId);
        }
        catch (e) {
            logger_1.default.error(`[Automation Birthday] Erro ao buscar WhatsApp padrão: ${e}`);
            return;
        }
        // Processar cada contato
        for (const contact of contacts) {
            for (const automation of automations) {
                try {
                    // Criar ou buscar ticket para o contato
                    const ticket = await (0, FindOrCreateTicketService_1.default)(contact, whatsapp, 0, // unreadMessages
                    companyId, 0, // queueId
                    null, // userId
                    null, // groupContact
                    "whatsapp", // channel
                    null, // wbot
                    false // isImported
                    );
                    await (0, ProcessAutomationService_1.processAutomationForContact)(automation, contact, ticket);
                    logger_1.default.info(`[Automation Birthday] Automação ${automation.id} processada para contato ${contact.id}`);
                }
                catch (error) {
                    logger_1.default.error(`[Automation Birthday] Erro ao processar automação ${automation.id} para contato ${contact.id}: ${error.message}`);
                }
            }
        }
    }
    catch (error) {
        logger_1.default.error(`[Automation Birthday] Erro geral: ${error.message}`);
    }
};
exports.processBirthdayAutomations = processBirthdayAutomations;
exports.default = exports.processBirthdayAutomations;
