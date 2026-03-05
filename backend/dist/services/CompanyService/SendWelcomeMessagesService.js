"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWelcomeWhatsappText = exports.sendWelcomeEmail = void 0;
const Setting_1 = __importDefault(require("../../models/Setting"));
const SendMailWithSettings_1 = require("../../helpers/SendMailWithSettings");
async function getWelcomeSettings() {
    try {
        const settings = await Setting_1.default.findAll({
            where: {
                companyId: 1,
                key: ["welcomeEmailText", "welcomeWhatsappText"]
            }
        });
        const welcomeEmailText = settings.find(s => s.key === "welcomeEmailText")?.value || "";
        const welcomeWhatsappText = settings.find(s => s.key === "welcomeWhatsappText")?.value || "";
        return { welcomeEmailText, welcomeWhatsappText };
    }
    catch (error) {
        console.error("Error fetching welcome settings:", error);
        return { welcomeEmailText: "", welcomeWhatsappText: "" };
    }
}
async function getAppName() {
    try {
        const setting = await Setting_1.default.findOne({
            where: {
                companyId: 1,
                key: "appName"
            }
        });
        return setting?.value || "Sistema";
    }
    catch (error) {
        return "Sistema";
    }
}
async function sendWelcomeEmail(data) {
    try {
        const { welcomeEmailText } = await getWelcomeSettings();
        const appName = await getAppName();
        if (!welcomeEmailText) {
            console.log("Welcome email text not configured");
            return false;
        }
        const variables = {
            nome: data.nome,
            email: data.email,
            empresa: data.empresa,
            telefone: data.telefone,
            plano: data.plano,
            senha: data.senha,
            diasTeste: data.diasTeste
        };
        const emailBody = (0, SendMailWithSettings_1.replaceVariables)(welcomeEmailText, variables);
        const result = await (0, SendMailWithSettings_1.SendMailWithSettings)({
            to: data.email,
            subject: `Bem-vindo ao ${appName}!`,
            html: emailBody.replace(/\n/g, '<br>')
        });
        if (result) {
            console.log(`Welcome email sent to ${data.email}`);
        }
        return result;
    }
    catch (error) {
        console.error("Error sending welcome email:", error);
        return false;
    }
}
exports.sendWelcomeEmail = sendWelcomeEmail;
async function getWelcomeWhatsappText(data) {
    try {
        const { welcomeWhatsappText } = await getWelcomeSettings();
        if (!welcomeWhatsappText) {
            console.log("Welcome WhatsApp text not configured");
            return null;
        }
        const variables = {
            nome: data.nome,
            email: data.email,
            empresa: data.empresa,
            telefone: data.telefone,
            plano: data.plano,
            senha: data.senha,
            diasTeste: data.diasTeste
        };
        return (0, SendMailWithSettings_1.replaceVariables)(welcomeWhatsappText, variables);
    }
    catch (error) {
        console.error("Error getting welcome WhatsApp text:", error);
        return null;
    }
}
exports.getWelcomeWhatsappText = getWelcomeWhatsappText;
exports.default = { sendWelcomeEmail, getWelcomeWhatsappText };
