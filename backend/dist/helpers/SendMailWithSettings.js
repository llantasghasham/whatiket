"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVariables = exports.SendMailWithSettings = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Setting_1 = __importDefault(require("../models/Setting"));
async function getSmtpSettings() {
    try {
        const settings = await Setting_1.default.findAll({
            where: {
                companyId: 1,
                key: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"]
            }
        });
        const smtpHost = settings.find(s => s.key === "smtpHost")?.value;
        const smtpPort = settings.find(s => s.key === "smtpPort")?.value;
        const smtpUser = settings.find(s => s.key === "smtpUser")?.value;
        const smtpPass = settings.find(s => s.key === "smtpPass")?.value;
        const smtpFrom = settings.find(s => s.key === "smtpFrom")?.value;
        if (!smtpHost || !smtpUser || !smtpPass) {
            console.log("SMTP settings not configured");
            return null;
        }
        return {
            smtpHost,
            smtpPort: smtpPort || "587",
            smtpUser,
            smtpPass,
            smtpFrom: smtpFrom || smtpUser
        };
    }
    catch (error) {
        console.error("Error fetching SMTP settings:", error);
        return null;
    }
}
async function SendMailWithSettings(mailData) {
    const smtpSettings = await getSmtpSettings();
    if (!smtpSettings) {
        console.log("SMTP not configured, falling back to env variables");
        // Fallback para variáveis de ambiente
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER) {
            console.error("No SMTP configuration available");
            return false;
        }
        const options = {
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT || "465"),
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        };
        try {
            const transporter = nodemailer_1.default.createTransport(options);
            await transporter.sendMail({
                from: process.env.MAIL_FROM,
                to: mailData.to,
                subject: mailData.subject,
                text: mailData.text,
                html: mailData.html || mailData.text
            });
            return true;
        }
        catch (error) {
            console.error("Error sending email with env config:", error);
            return false;
        }
    }
    const port = parseInt(smtpSettings.smtpPort);
    const secure = port === 465;
    const options = {
        host: smtpSettings.smtpHost,
        port: port,
        secure: secure,
        auth: {
            user: smtpSettings.smtpUser,
            pass: smtpSettings.smtpPass
        }
    };
    // Para portas não seguras, usar TLS
    if (!secure) {
        options.tls = {
            rejectUnauthorized: false
        };
    }
    try {
        const transporter = nodemailer_1.default.createTransport(options);
        const info = await transporter.sendMail({
            from: smtpSettings.smtpFrom,
            to: mailData.to,
            subject: mailData.subject,
            text: mailData.text,
            html: mailData.html || mailData.text
        });
        console.log("Email sent successfully:", info.messageId);
        return true;
    }
    catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
exports.SendMailWithSettings = SendMailWithSettings;
// Função para substituir variáveis no texto
function replaceVariables(text, variables) {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }
    return result;
}
exports.replaceVariables = replaceVariables;
