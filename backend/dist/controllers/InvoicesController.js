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
exports.remove = exports.sendBillingNotification = exports.adminManualPay = exports.pay = exports.update = exports.list = exports.store = exports.show = exports.index = void 0;
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const Invoices_1 = __importDefault(require("../models/Invoices"));
const Company_1 = __importDefault(require("../models/Company"));
const Setting_1 = __importDefault(require("../models/Setting"));
const SendMailWithSettings_1 = require("../helpers/SendMailWithSettings");
const ShowCompanyService_1 = __importDefault(require("../services/CompanyService/ShowCompanyService"));
const FindCompaniesWhatsappService_1 = __importDefault(require("../services/CompanyService/FindCompaniesWhatsappService"));
const wbot_1 = require("../libs/wbot");
const moment_1 = __importDefault(require("moment"));
const FindAllInvoiceService_1 = __importDefault(require("../services/InvoicesService/FindAllInvoiceService"));
const ListInvoicesServices_1 = __importDefault(require("../services/InvoicesService/ListInvoicesServices"));
const ShowInvoiceService_1 = __importDefault(require("../services/InvoicesService/ShowInvoiceService"));
const UpdateInvoiceService_1 = __importDefault(require("../services/InvoicesService/UpdateInvoiceService"));
const DeleteInvoiceService_1 = __importDefault(require("../services/InvoicesService/DeleteInvoiceService"));
const CreateInvoiceService_1 = __importDefault(require("../services/InvoicesService/CreateInvoiceService"));
const index = async (req, res) => {
    const { searchParam, pageNumber } = req.query;
    const { invoices, count, hasMore } = await (0, ListInvoicesServices_1.default)({
        searchParam,
        pageNumber
    });
    return res.json({ invoices, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { id } = req.params;
    const invoice = await (0, ShowInvoiceService_1.default)(id);
    return res.status(200).json(invoice);
};
exports.show = show;
const store = async (req, res) => {
    const newPlan = req.body;
    const plan = await (0, CreateInvoiceService_1.default)(newPlan);
    return res.status(200).json(plan);
};
exports.store = store;
const list = async (req, res) => {
    const { companyId } = req.user;
    // Company 1 (super admin) vê todas as faturas
    if (+companyId === 1) {
        const allInvoices = await Invoices_1.default.findAll({
            include: [{ model: Company_1.default, as: "company", attributes: ["id", "name"] }],
            order: [["id", "ASC"]]
        });
        return res.status(200).json(allInvoices);
    }
    const invoice = await (0, FindAllInvoiceService_1.default)(+companyId);
    return res.status(200).json(invoice);
};
exports.list = list;
const update = async (req, res) => {
    const InvoiceData = req.body;
    const schema = Yup.object().shape({
        name: Yup.string()
    });
    try {
        await schema.validate(InvoiceData);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const { id, status } = InvoiceData;
    const plan = await (0, UpdateInvoiceService_1.default)({
        id,
        status,
    });
    // const io = getIO();
    // io.of(companyId.toString())
    // .emit("plan", {
    //   action: "update",
    //   plan
    // });
    return res.status(200).json(plan);
};
exports.update = update;
const pay = async (req, res) => {
    const { invoiceId, amount, description, dueDate, companyId } = req.body;
    const userId = req.user.id; // Corrigido: usar req.user.id
    try {
        // Aqui você implementaria a integração com gateway de pagamento
        // Por enquanto, vamos simular o pagamento
        // 1. Atualizar status da fatura para "paid"
        const invoice = await (0, UpdateInvoiceService_1.default)({
            id: invoiceId,
            status: "paid"
        });
        // 2. Gerar link de pagamento (simulado)
        const paymentLink = `https://checkout.pagamento.com.br/pay/${invoiceId}`;
        // 3. Retornar dados do pagamento
        return res.status(200).json({
            success: true,
            invoiceId,
            paymentLink,
            amount,
            status: "paid",
            message: "Pagamento processado com sucesso"
        });
    }
    catch (err) {
        throw new AppError_1.default("Erro ao processar pagamento: " + err.message);
    }
};
exports.pay = pay;
const adminManualPay = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { id } = req.params;
    const invoice = await Invoices_1.default.findByPk(id);
    if (!invoice) {
        throw new AppError_1.default("ERR_NO_INVOICE_FOUND", 404);
    }
    await invoice.update({ status: "paid" });
    // Estender dueDate da empresa em 30 dias a partir de hoje
    if (invoice.companyId) {
        const Company = require("../models/Company").default;
        const company = await Company.findByPk(invoice.companyId);
        if (company) {
            const moment = require("moment");
            const currentDueDate = moment(company.dueDate);
            const today = moment();
            const baseDate = currentDueDate.isAfter(today) ? currentDueDate : today;
            const newDueDate = baseDate.add(30, "days").format("YYYY-MM-DD");
            await company.update({ dueDate: newDueDate });
        }
    }
    return res.status(200).json({
        message: "Fatura marcada como paga com sucesso!",
        invoice
    });
};
exports.adminManualPay = adminManualPay;
const formatPhoneToWhatsappJid = (rawPhone) => {
    if (!rawPhone)
        return null;
    let digits = rawPhone.replace(/\D/g, "");
    if (!digits)
        return null;
    if (!digits.startsWith("55")) {
        digits = "55" + digits;
    }
    return digits + "@s.whatsapp.net";
};
const sendBillingNotification = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { id } = req.params;
    const invoice = await Invoices_1.default.findByPk(id, {
        include: [{ model: Company_1.default, as: "company" }]
    });
    if (!invoice) {
        throw new AppError_1.default("ERR_NO_INVOICE_FOUND", 404);
    }
    const targetCompany = invoice.company;
    if (!targetCompany) {
        throw new AppError_1.default("ERR_COMPANY_NOT_FOUND", 404);
    }
    let appName = "Sistema";
    try {
        const setting = await Setting_1.default.findOne({
            where: { companyId: 1, key: "appName" }
        });
        appName = setting?.value || "Sistema";
    }
    catch (e) { }
    const dueDate = (0, moment_1.default)(invoice.dueDate).format("DD/MM/YYYY");
    const value = Number(invoice.value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    // Determinar tipo de cobrança baseado na data de vencimento
    const hoje = (0, moment_1.default)().startOf("day");
    const venc = (0, moment_1.default)(invoice.dueDate).startOf("day");
    const dias = venc.diff(hoje, "days");
    let settingKey = "invoiceMsgAviso"; // antes do vencimento
    if (dias < 0) {
        settingKey = "invoiceMsgAtrasada"; // vencida
    }
    else if (dias === 0) {
        settingKey = "invoiceMsgDia"; // vence hoje
    }
    // Buscar template configurável
    let msgTemplate = "";
    try {
        const msgSetting = await Setting_1.default.findOne({
            where: { companyId: 1, key: settingKey }
        });
        msgTemplate = msgSetting?.value || "";
    }
    catch (e) { }
    // Função para substituir variáveis no template
    const replaceVars = (text) => {
        return text
            .replace(/\{empresa\}/g, targetCompany.name || "")
            .replace(/\{plano\}/g, invoice.detail || "")
            .replace(/\{valor\}/g, value)
            .replace(/\{vencimento\}/g, dueDate)
            .replace(/\{link\}/g, "");
    };
    // Mensagem padrão caso não tenha template configurado
    const defaultWhatsappBody = `*Aviso de Cobrança - ${appName}*\n\nOlá *${targetCompany.name}*,\n\nIdentificamos que a fatura abaixo encontra-se em aberto:\n\n*Detalhes:* ${invoice.detail}\n*Valor:* ${value}\n*Vencimento:* ${dueDate}\n\nPor favor, regularize o pagamento o mais breve possível para evitar a suspensão dos serviços.\n\nEm caso de dúvidas, entre em contato conosco.\n\nAtenciosamente,\n*${appName}*`;
    const whatsappBody = msgTemplate ? replaceVars(msgTemplate) : defaultWhatsappBody;
    const results = { email: false, whatsapp: false };
    // Enviar email de cobrança
    if (targetCompany.email) {
        try {
            const emailBody = `
        <h2>Aviso de Cobrança - ${appName}</h2>
        <p>Olá <strong>${targetCompany.name}</strong>,</p>
        <p>Identificamos que a fatura abaixo encontra-se em aberto:</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Detalhes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${invoice.detail}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Valor</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vencimento</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dueDate}</td></tr>
        </table>
        <p>Por favor, regularize o pagamento o mais breve possível para evitar a suspensão dos serviços.</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <br>
        <p>Atenciosamente,<br><strong>${appName}</strong></p>
      `;
            const sent = await (0, SendMailWithSettings_1.SendMailWithSettings)({
                to: targetCompany.email,
                subject: `Aviso de Cobrança - Fatura ${invoice.detail} - ${appName}`,
                html: emailBody
            });
            results.email = sent;
        }
        catch (error) {
            console.error("Error sending billing email:", error);
        }
    }
    // Enviar WhatsApp de cobrança
    if (targetCompany.phone) {
        try {
            const adminCompany = await (0, ShowCompanyService_1.default)(1);
            const whatsappCompany = await (0, FindCompaniesWhatsappService_1.default)(adminCompany.id);
            const firstWhatsapp = whatsappCompany.whatsapps[0];
            const phoneJid = formatPhoneToWhatsappJid(targetCompany.phone);
            if (firstWhatsapp?.status === "CONNECTED" && phoneJid) {
                const wbot = (0, wbot_1.getWbot)(firstWhatsapp.id);
                const sendOptions = { createChat: false };
                await wbot.sendMessage(phoneJid, { text: whatsappBody }, sendOptions);
                results.whatsapp = true;
            }
        }
        catch (error) {
            console.error("Error sending billing WhatsApp:", error);
        }
    }
    return res.status(200).json({
        message: "Notificação de cobrança enviada!",
        results
    });
};
exports.sendBillingNotification = sendBillingNotification;
const remove = async (req, res) => {
    const { id } = req.params;
    const invoice = await (0, DeleteInvoiceService_1.default)(id);
    return res.status(200).json(invoice);
};
exports.remove = remove;
