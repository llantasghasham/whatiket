"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const sequelize_1 = require("sequelize");
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const ScheduledDispatchLog_1 = __importDefault(require("../../models/ScheduledDispatchLog"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const dispatchQueue_1 = require("../../queues/dispatchQueue");
const logger_1 = __importDefault(require("../../utils/logger"));
const TZ = process.env.TZ || "America/Sao_Paulo";
const OPEN_INVOICE_STATUS = ["aberta", "vencida"];
const hasRunForContactToday = async (dispatcherId, companyId, contactId, dayStart, dayEnd) => {
    const existing = await ScheduledDispatchLog_1.default.findOne({
        where: {
            dispatcherId,
            companyId,
            contactId,
            createdAt: {
                [sequelize_1.Op.between]: [dayStart, dayEnd]
            }
        }
    });
    return !!existing;
};
const collectBirthdayTargets = async (dispatcher, now) => {
    const clients = await CrmClient_1.default.findAll({
        where: {
            companyId: dispatcher.companyId,
            birthDate: { [sequelize_1.Op.ne]: null },
            status: "active"
        },
        include: [
            {
                model: Contact_1.default,
                as: "contact"
            }
        ]
    });
    const today = now.format("MM-DD");
    return clients
        .map(client => {
        if (!client.birthDate)
            return null;
        const birthday = (0, moment_timezone_1.default)(client.birthDate).tz(TZ).format("MM-DD");
        if (birthday !== today)
            return null;
        const contact = client.contact;
        if (!contact?.id || !contact.number)
            return null;
        return { contact, client };
    })
        .filter(Boolean);
};
const collectReminderTargets = async (dispatcher, now) => {
    const daysBefore = dispatcher.daysBeforeDue ?? 0;
    const targetDate = now
        .clone()
        .add(daysBefore, "days")
        .format("YYYY-MM-DD");
    const invoices = await FinanceiroFatura_1.default.findAll({
        where: {
            companyId: dispatcher.companyId,
            status: { [sequelize_1.Op.in]: OPEN_INVOICE_STATUS },
            dataVencimento: targetDate
        },
        include: [
            {
                model: CrmClient_1.default,
                include: [
                    {
                        model: Contact_1.default,
                        as: "contact"
                    }
                ]
            }
        ]
    });
    return invoices
        .map(invoice => {
        const contact = invoice.client?.contact;
        if (!contact)
            return null;
        return {
            contact,
            client: invoice.client,
            extra: { invoice }
        };
    })
        .filter(Boolean);
};
const collectOverdueTargets = async (dispatcher, now) => {
    const daysAfter = dispatcher.daysAfterDue ?? 0;
    const limitDate = now.clone().subtract(daysAfter, "days").format("YYYY-MM-DD");
    const invoices = await FinanceiroFatura_1.default.findAll({
        where: {
            companyId: dispatcher.companyId,
            status: { [sequelize_1.Op.in]: OPEN_INVOICE_STATUS },
            dataVencimento: { [sequelize_1.Op.lte]: limitDate }
        },
        include: [
            {
                model: CrmClient_1.default,
                include: [
                    {
                        model: Contact_1.default,
                        as: "contact"
                    }
                ]
            }
        ]
    });
    return invoices
        .map(invoice => {
        const contact = invoice.client?.contact;
        if (!contact)
            return null;
        return {
            contact,
            client: invoice.client,
            extra: { invoice }
        };
    })
        .filter(Boolean);
};
const formatCurrencyPtBr = (value) => {
    const numericValue = Number(value ?? 0);
    return numericValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
const buildVariables = (dispatcher, contact, extra, client) => {
    const variables = {
        contactName: contact.name,
        firstName: contact.name?.split(" ")[0] || "",
        contactNumber: contact.number,
        contactEmail: contact.email,
        dispatcherTitle: dispatcher.title
    };
    if (client) {
        variables.clientName = client.name || client.companyName;
        variables.clientType = client.type;
        variables.clientStatus = client.status;
        if (client.birthDate) {
            variables.clientBirthday = (0, moment_timezone_1.default)(client.birthDate).format("YYYY-MM-DD");
        }
    }
    if (contact.birthday) {
        variables.contactBirthday = (0, moment_timezone_1.default)(contact.birthday).format("YYYY-MM-DD");
    }
    if (extra?.invoice) {
        const invoice = extra.invoice;
        const dueMoment = (0, moment_timezone_1.default)(invoice.dataVencimento).tz(TZ);
        const invoiceNumericValue = Number(invoice.valor ?? 0);
        variables.invoiceId = invoice.id;
        variables.invoiceValue = formatCurrencyPtBr(invoice.valor);
        variables.invoiceValueRaw = invoiceNumericValue;
        variables.invoiceDueDate = dueMoment.format("DD/MM/YYYY");
        variables.invoiceDueDateISO = dueMoment.format("YYYY-MM-DD");
        variables.invoiceStatus = invoice.status;
        variables.invoiceDescription = invoice.descricao || "";
        const today = (0, moment_timezone_1.default)().tz(TZ);
        variables.daysUntilDue = dueMoment.diff(today, "days");
        variables.daysLate = today.diff(dueMoment, "days");
    }
    return variables;
};
const loadTargets = async (dispatcher, now) => {
    switch (dispatcher.eventType) {
        case "birthday":
            return collectBirthdayTargets(dispatcher, now);
        case "invoice_reminder":
            return collectReminderTargets(dispatcher, now);
        case "invoice_overdue":
            return collectOverdueTargets(dispatcher, now);
        default:
            return [];
    }
};
const ensureDispatcherReady = (dispatcher, now) => {
    const startDateTime = moment_timezone_1.default
        .tz(`${now.format("YYYY-MM-DD")} ${dispatcher.startTime}`, "YYYY-MM-DD HH:mm", TZ);
    if (now.isBefore(startDateTime)) {
        return false;
    }
    if (!dispatcher.whatsappId) {
        logger_1.default.warn(`[ScheduledDispatcher] Dispatcher ${dispatcher.id} sem whatsapp configurado`);
        return false;
    }
    return true;
};
const runScheduledDispatchers = async () => {
    const now = (0, moment_timezone_1.default)().tz(TZ);
    const dayStart = now.clone().startOf("day").toDate();
    const dayEnd = now.clone().endOf("day").toDate();
    const dispatchers = await ScheduledDispatcher_1.default.findAll({
        where: { active: true }
    });
    for (const dispatcher of dispatchers) {
        if (!ensureDispatcherReady(dispatcher, now)) {
            continue;
        }
        let sendOffset = 0;
        const targets = await loadTargets(dispatcher, now);
        if (!targets.length) {
            continue;
        }
        logger_1.default.info(`[ScheduledDispatcher] Dispatcher ${dispatcher.id} - ${targets.length} alvos encontrados`);
        for (const target of targets) {
            const { contact, extra, client } = target;
            if (!contact?.id || !contact.number) {
                continue;
            }
            const alreadySent = await hasRunForContactToday(dispatcher.id, dispatcher.companyId, contact.id, dayStart, dayEnd);
            if (alreadySent) {
                continue;
            }
            const log = await ScheduledDispatchLog_1.default.create({
                dispatcherId: dispatcher.id,
                contactId: contact.id,
                companyId: dispatcher.companyId,
                status: "queued"
            });
            const delayMs = sendOffset * (dispatcher.sendIntervalSeconds || 30) * 1000;
            sendOffset += 1;
            const variables = buildVariables(dispatcher, contact, extra, client || null);
            await (0, dispatchQueue_1.addDispatchJob)({
                logId: log.id,
                dispatcherId: dispatcher.id,
                companyId: dispatcher.companyId,
                contactId: contact.id,
                whatsappId: dispatcher.whatsappId,
                template: dispatcher.messageTemplate,
                variables,
                delayMs
            }, {});
        }
    }
};
exports.default = runScheduledDispatchers;
