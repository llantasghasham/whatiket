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
exports.adminDisable2FA = exports.disable2FA = exports.confirm2FA = exports.setup2FA = exports.checkEmail = exports.toggleChangeWidht = exports.mediaUpload = exports.list = exports.remove = exports.update = exports.showEmail = exports.show = exports.store = exports.index = void 0;
const Yup = __importStar(require("yup"));
const socket_1 = require("../libs/socket");
const CheckSettings_1 = __importDefault(require("../helpers/CheckSettings"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const Affiliate_1 = __importDefault(require("../models/Affiliate"));
const Coupon_1 = __importDefault(require("../models/Coupon"));
const AffiliateLink_1 = __importDefault(require("../models/AffiliateLink"));
const affiliateUtils_1 = require("../utils/affiliateUtils");
const CreateUserService_1 = __importDefault(require("../services/UserServices/CreateUserService"));
const ListUsersService_1 = __importDefault(require("../services/UserServices/ListUsersService"));
const UpdateUserService_1 = __importDefault(require("../services/UserServices/UpdateUserService"));
const ShowUserService_1 = __importDefault(require("../services/UserServices/ShowUserService"));
const DeleteUserService_1 = __importDefault(require("../services/UserServices/DeleteUserService"));
const SimpleListService_1 = __importDefault(require("../services/UserServices/SimpleListService"));
const CreateCompanyService_1 = __importDefault(require("../services/CompanyService/CreateCompanyService"));
const SendMail_1 = require("../helpers/SendMail");
const SendMailWithSettings_1 = require("../helpers/SendMailWithSettings");
const useDate_1 = require("../utils/useDate");
const Setting_1 = __importDefault(require("../models/Setting"));
const Plan_1 = __importDefault(require("../models/Plan"));
const ShowCompanyService_1 = __importDefault(require("../services/CompanyService/ShowCompanyService"));
const wbot_1 = require("../libs/wbot");
const FindCompaniesWhatsappService_1 = __importDefault(require("../services/CompanyService/FindCompaniesWhatsappService"));
const User_1 = __importDefault(require("../models/User"));
const lodash_1 = require("lodash");
const ToggleChangeWidthService_1 = __importDefault(require("../services/UserServices/ToggleChangeWidthService"));
const APIShowEmailUserService_1 = __importDefault(require("../services/UserServices/APIShowEmailUserService"));
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const publicSignupSchema = Yup.object().shape({
    companyName: Yup.string()
        .trim()
        .min(2, "ERR_COMPANY_INVALID_NAME")
        .required("ERR_COMPANY_INVALID_NAME"),
    name: Yup.string()
        .trim()
        .min(2, "ERR_USER_INVALID_NAME")
        .required("ERR_USER_INVALID_NAME"),
    email: Yup.string()
        .trim()
        .email("ERR_INVALID_EMAIL")
        .required("ERR_INVALID_EMAIL"),
    password: Yup.string()
        .min(6, "ERR_INVALID_PASSWORD")
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, "ERR_INVALID_PASSWORD")
        .required("ERR_INVALID_PASSWORD"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "ERR_PASSWORD_CONFIRMATION")
        .required("ERR_PASSWORD_CONFIRMATION"),
    phone: Yup.string()
        .min(10, "ERR_INVALID_PHONE")
        .required("ERR_INVALID_PHONE"),
    type: Yup.string()
        .oneOf(["pf", "pj"], "ERR_INVALID_TYPE")
        .default("pf"),
    document: Yup.string()
        .when("type", {
        is: "pf",
        then: Yup.string()
            .matches(/^\d{11}$/, "ERR_INVALID_CPF")
            .required("ERR_CPF_REQUIRED"),
        otherwise: Yup.string()
            .matches(/^\d{14}$/, "ERR_INVALID_CNPJ")
            .required("ERR_CNPJ_REQUIRED")
    }),
    segment: Yup.string().optional(),
    planId: Yup.number()
        .typeError("ERR_INVALID_PLAN")
        .positive("ERR_INVALID_PLAN")
        .integer("ERR_INVALID_PLAN")
        .required("ERR_INVALID_PLAN"),
    affiliateCode: Yup.string().optional(),
    couponCode: Yup.string().optional()
});
const formatPhoneToWhatsappJid = (rawPhone) => {
    if (!rawPhone)
        return null;
    let digits = rawPhone.replace(/\D/g, "");
    if (!digits)
        return null;
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
        digits = `55${digits}`;
    }
    if (digits.startsWith("55") && digits.length > 13) {
        // remove duplicated country code if user already included 55
        digits = digits.replace(/^55+/, "55");
    }
    return `${digits}@s.whatsapp.net`;
};
const index = async (req, res) => {
    const { searchParam, pageNumber } = req.query;
    const { companyId, profile } = req.user;
    const { users, count, hasMore } = await (0, ListUsersService_1.default)({
        searchParam,
        pageNumber,
        companyId,
        profile
    });
    return res.json({ users, count, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const { email, password, name, companyName, phone, profile, companyId: bodyCompanyId, queueIds, planId, startWork, endWork, whatsappId, allTicket, defaultTheme, defaultMenu, allowGroup, allHistoric, allUserChat, userClosePendingTicket, showDashboard, defaultTicketsManagerWidth = 550, allowRealTime, allowConnections, confirmPassword, status, dueDate: bodyDueDate, recurrence: bodyRecurrence, campaignsEnabled, document, type, segment, affiliateCode, couponCode } = req.body;
    let userCompanyId = null;
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
        throw new AppError_1.default("ERR_EMAIL_REQUIRED", 400);
    }
    if (!password || String(password).trim().length === 0) {
        throw new AppError_1.default("ERR_PASSWORD_REQUIRED", 400);
    }
    const sanitizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
    if (req.url === "/signup") {
        try {
            await publicSignupSchema.validate({
                companyName,
                name,
                email: normalizedEmail,
                password,
                confirmPassword,
                phone: sanitizedPhone,
                type,
                document,
                segment,
                planId
            }, { abortEarly: false });
        }
        catch (error) {
            const errMap = {
                "ERR_INVALID_TYPE": "Tipo inválido. Use 'pf' para pessoa física ou 'pj' para pessoa jurídica.",
                "ERR_INVALID_CPF": "CPF inválido. Deve conter 11 dígitos numéricos.",
                "ERR_INVALID_CNPJ": "CNPJ inválido. Deve conter 14 dígitos numéricos.",
                "ERR_CPF_REQUIRED": "CPF é obrigatório para pessoa física.",
                "ERR_CNPJ_REQUIRED": "CNPJ é obrigatório para pessoa jurídica.",
                "ERR_INVALID_SEGMENT": "Segmento inválido. Escolha uma das opções disponíveis.",
                "ERR_SEGMENT_REQUIRED": "Segmento é obrigatório.",
                "ERR_COMPANY_INVALID_NAME": "Nome da empresa inválido (mínimo 2 caracteres).",
                "ERR_USER_INVALID_NAME": "Nome do usuário inválido (mínimo 2 caracteres).",
                "ERR_INVALID_EMAIL": "E-mail inválido.",
                "ERR_INVALID_PASSWORD": "Senha inválida (mínimo 6 caracteres, com letras e números).",
                "ERR_PASSWORD_CONFIRMATION": "Confirmação de senha não coincide.",
                "ERR_INVALID_PHONE": "Telefone inválido (mínimo 10 dígitos).",
                "ERR_INVALID_PLAN": "Plano inválido."
            };
            throw new AppError_1.default(errMap[error.errors?.[0]] || "ERR_INVALID_SIGNUP_DATA");
        }
    }
    const generatedCompanyName = (companyName && companyName.trim()) ||
        (normalizedEmail.includes("@") ? normalizedEmail.split("@")[0] : "") ||
        `empresa-${Date.now()}`;
    const resolvedCompanyName = generatedCompanyName.length >= 2 ? generatedCompanyName : `empresa-${Date.now()}`;
    const resolvedUserName = (name && name.trim()) || resolvedCompanyName;
    const parsedPlanId = Number(planId);
    const envPlanId = process.env.DEFAULT_PLAN_ID ? Number(process.env.DEFAULT_PLAN_ID) : undefined;
    const resolvedPlanId = !Number.isNaN(parsedPlanId) && parsedPlanId > 0
        ? parsedPlanId
        : envPlanId && !Number.isNaN(envPlanId) && envPlanId > 0
            ? envPlanId
            : 1;
    const { dateToClient } = (0, useDate_1.useDate)();
    if (req.user !== undefined) {
        const { companyId: cId } = req.user;
        userCompanyId = cId;
    }
    if (req.url === "/signup" &&
        (await (0, CheckSettings_1.default)("userCreation")) === "disabled") {
        throw new AppError_1.default("ERR_USER_CREATION_DISABLED", 403);
    }
    else if (req.url !== "/signup" && req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    if (process.env.DEMO === "ON") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    // const companyUser = bodyCompanyId || userCompanyId;
    const companyUser = userCompanyId;
    if (!companyUser) {
        // Busca dias de teste configurados
        let trialDays = 7;
        try {
            const trialDaysSetting = await Setting_1.default.findOne({
                where: { companyId: 1, key: "trialDays" }
            });
            if (trialDaysSetting?.value) {
                trialDays = parseInt(trialDaysSetting.value) || 7;
            }
        }
        catch (e) {
            console.log("Error fetching trialDays setting, using default 7");
        }
        const trialExpirationDate = new Date();
        trialExpirationDate.setDate(trialExpirationDate.getDate() + trialDays);
        const date = trialExpirationDate.toISOString().split("T")[0];
        const resolvedStatus = typeof status === "boolean"
            ? status
            : status === "t" || status === "true" || status === "1" || status === 1 || status === "active" || status === "on";
        const resolvedDueDate = bodyDueDate || date;
        const resolvedRecurrence = bodyRecurrence || "MENSAL";
        const resolvedCampaignsEnabled = typeof campaignsEnabled === "boolean" ? campaignsEnabled : true;
        // Processar código de afiliado se fornecido
        let referredByCompanyId = null;
        let resolvedAffiliateId = null;
        let resolvedAffiliateLinkId = null;
        if (affiliateCode) {
            const affiliateLink = await AffiliateLink_1.default.findOne({
                where: { code: affiliateCode.toUpperCase() }
            });
            if (affiliateLink) {
                const affiliate = await Affiliate_1.default.findByPk(affiliateLink.affiliateId);
                if (affiliate && affiliate.status === "active") {
                    referredByCompanyId = affiliate.companyId;
                    resolvedAffiliateId = affiliate.id;
                    resolvedAffiliateLinkId = affiliateLink.id;
                }
            }
        }
        // Processar cupom de desconto se fornecido
        let couponId = null;
        let planAmount = 0;
        if (couponCode) {
            // Obter valor do plano para validar cupom
            const plan = await Plan_1.default.findByPk(resolvedPlanId);
            if (plan) {
                planAmount = parseFloat(plan.amount);
                const couponValidation = await (0, affiliateUtils_1.validateCoupon)(couponCode, planAmount);
                if (!couponValidation.valid) {
                    throw new AppError_1.default(couponValidation.error || "Cupom inválido", 400);
                }
                // Buscar cupom para obter ID
                const coupon = await Coupon_1.default.findOne({
                    where: { code: couponCode.toUpperCase() }
                });
                if (coupon) {
                    couponId = coupon.id;
                    // Incrementar uso do cupom
                    await coupon.increment("usedCount");
                }
            }
        }
        const companyData = {
            name: resolvedCompanyName,
            email: normalizedEmail,
            phone: sanitizedPhone,
            planId: resolvedPlanId,
            status: resolvedStatus !== undefined ? resolvedStatus : true,
            dueDate: resolvedDueDate,
            recurrence: resolvedRecurrence,
            document: document || "",
            paymentMethod: "",
            password: password,
            companyUserName: resolvedUserName,
            startWork: startWork,
            endWork: endWork,
            defaultTheme: "light",
            defaultMenu: "closed",
            allowGroup: false,
            allHistoric: false,
            userClosePendingTicket: "enabled",
            showDashboard: "disabled",
            defaultTicketsManagerWidth: 550,
            allowRealTime: "disabled",
            allowConnections: "disabled",
            campaignsEnabled: resolvedCampaignsEnabled,
            type: type || "pf",
            segment: segment || "outros",
            referredBy: referredByCompanyId,
            couponId: couponId,
            affiliateId: resolvedAffiliateId,
            affiliateLinkId: resolvedAffiliateLinkId
        };
        const user = await (0, CreateCompanyService_1.default)(companyData);
        // Registrar signup no link do afiliado se aplicável
        if (affiliateCode && referredByCompanyId) {
            const affiliateLink = await AffiliateLink_1.default.findOne({
                where: { code: affiliateCode.toUpperCase() }
            });
            if (affiliateLink) {
                // Incrementar signups no link
                await affiliateLink.increment("signups");
                // Atualizar tracking data
                const trackingData = affiliateLink.trackingData || {};
                const today = new Date().toISOString().split('T')[0];
                if (!trackingData[today])
                    trackingData[today] = { clicks: 0, signups: 0 };
                trackingData[today].signups++;
                await affiliateLink.update({ trackingData });
            }
        }
        const frontendUrl = process.env.FRONTEND_URL || "";
        // Busca nome do plano
        let planName = "Plano Padrão";
        try {
            const plan = await Plan_1.default.findByPk(resolvedPlanId);
            if (plan) {
                planName = plan.name;
            }
        }
        catch (e) {
            console.log("Error fetching plan name");
        }
        // Busca nome do sistema
        let appName = "Sistema";
        try {
            const appNameSetting = await Setting_1.default.findOne({
                where: { companyId: 1, key: "appName" }
            });
            if (appNameSetting?.value) {
                appName = appNameSetting.value;
            }
        }
        catch (e) {
            console.log("Error fetching appName");
        }
        // Variáveis para substituição nas mensagens
        const messageVariables = {
            nome: name || resolvedUserName,
            email: normalizedEmail,
            empresa: resolvedCompanyName,
            telefone: sanitizedPhone,
            plano: planName,
            senha: password,
            diasTeste: String(trialDays),
            dataVencimento: dateToClient(date),
            link: frontendUrl,
            sistema: appName
        };
        // Busca textos personalizados de boas-vindas
        let welcomeEmailText = "";
        let welcomeWhatsappText = "";
        try {
            const welcomeSettings = await Setting_1.default.findAll({
                where: { companyId: 1, key: ["welcomeEmailText", "welcomeWhatsappText"] }
            });
            welcomeEmailText = welcomeSettings.find(s => s.key === "welcomeEmailText")?.value || "";
            welcomeWhatsappText = welcomeSettings.find(s => s.key === "welcomeWhatsappText")?.value || "";
        }
        catch (e) {
            console.log("Error fetching welcome message settings");
        }
        // Envia email de boas-vindas
        try {
            let emailBody = "";
            let emailSubject = `Bem-vindo ao ${appName}!`;
            if (welcomeEmailText) {
                // Usa texto personalizado
                emailBody = (0, SendMailWithSettings_1.replaceVariables)(welcomeEmailText, messageVariables);
            }
            else {
                // Usa texto padrão
                emailBody = `Olá ${name}, este é um email sobre o cadastro da ${resolvedCompanyName}!<br><br>
        Segue os dados da sua empresa (teste válido por ${trialDays} dias):<br><br>
        Nome: ${resolvedCompanyName}<br>
        Email: ${normalizedEmail}<br>
        Senha: ${password}<br>
        Válido até: ${dateToClient(date)}${frontendUrl ? `<br><br>Link de acesso à plataforma: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a>` : ""}`;
            }
            await (0, SendMailWithSettings_1.SendMailWithSettings)({
                to: normalizedEmail,
                subject: emailSubject,
                html: emailBody.replace(/\n/g, '<br>')
            });
            console.log("Welcome email sent successfully");
        }
        catch (error) {
            console.log('Não consegui enviar o email:', error);
            // Fallback para método antigo
            try {
                const _email = {
                    to: normalizedEmail,
                    subject: `Login e senha da Empresa ${resolvedCompanyName}`,
                    text: `Olá ${name}, este é um email sobre o cadastro da ${resolvedCompanyName}!<br><br>
          Segue os dados da sua empresa (teste válido por ${trialDays} dias):<br><br>
          Nome: ${resolvedCompanyName}<br>
          Email: ${normalizedEmail}<br>
          Senha: ${password}<br>
          Válido até: ${dateToClient(date)}${frontendUrl ? `<br><br>Link de acesso à plataforma: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a>` : ""}`
                };
                await (0, SendMail_1.SendMail)(_email);
            }
            catch (fallbackError) {
                console.log('Fallback email também falhou');
            }
        }
        // Envia WhatsApp de boas-vindas
        try {
            const company = await (0, ShowCompanyService_1.default)(1);
            const whatsappCompany = await (0, FindCompaniesWhatsappService_1.default)(company.id);
            const firstWhatsapp = whatsappCompany.whatsapps[0];
            const phoneJid = formatPhoneToWhatsappJid(phone);
            if (firstWhatsapp?.status === "CONNECTED" &&
                phoneJid) {
                const wbot = (0, wbot_1.getWbot)(firstWhatsapp.id);
                let whatsappBody = "";
                if (welcomeWhatsappText) {
                    // Usa texto personalizado
                    whatsappBody = (0, SendMailWithSettings_1.replaceVariables)(welcomeWhatsappText, messageVariables);
                }
                else {
                    // Usa texto padrão
                    whatsappBody = `Olá ${name}, este é uma mensagem sobre o cadastro da ${resolvedCompanyName}!\n\nTeste válido por ${trialDays} dias. Segue os dados da sua empresa:\n\nNome: ${resolvedCompanyName}\nEmail: ${normalizedEmail}\nSenha: ${password}\nVálido até: ${dateToClient(date)}${frontendUrl ? `\n\nLink de acesso à plataforma: ${frontendUrl}` : ""}`;
                }
                const sendOptions = { createChat: false };
                await wbot.sendMessage(phoneJid, { text: whatsappBody }, sendOptions);
                console.log("Welcome WhatsApp sent successfully");
            }
        }
        catch (error) {
            console.log('Não consegui enviar a mensagem WhatsApp:', error);
        }
        return res.status(200).json(user);
    }
    if (companyUser) {
        const user = await (0, CreateUserService_1.default)({
            email,
            password,
            name,
            profile,
            companyId: companyUser,
            queueIds,
            startWork,
            endWork,
            whatsappId,
            allTicket,
            defaultTheme,
            defaultMenu,
            allowGroup,
            allHistoric,
            allUserChat,
            userClosePendingTicket,
            showDashboard,
            defaultTicketsManagerWidth,
            allowRealTime,
            allowConnections
        });
        const io = (0, socket_1.getIO)();
        io.of(userCompanyId.toString())
            .emit(`company-${userCompanyId}-user`, {
            action: "create",
            user
        });
        return res.status(200).json(user);
    }
};
exports.store = store;
// export const store = async (req: Request, res: Response): Promise<Response> => {
//   const {
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId,
//     queueIds
//   } = req.body;
//   let userCompanyId: number | null = null;
//   if (req.user !== undefined) {
//     const { companyId: cId } = req.user;
//     userCompanyId = cId;
//   }
//   if (
//     req.url === "/signup" &&
//     (await CheckSettingsHelper("userCreation")) === "disabled"
//   ) {
//     throw new AppError("ERR_USER_CREATION_DISABLED", 403);
//   } else if (req.url !== "/signup" && req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }
//   const user = await CreateUserService({
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId || userCompanyId,
//     queueIds
//   });
//   const io = getIO();
//   io.of(String(companyId))
//  .emit(`company-${userCompanyId}-user`, {
//     action: "create",
//     user
//   });
//   return res.status(200).json(user);
// };
const show = async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const user = await (0, ShowUserService_1.default)(userId, companyId);
    return res.status(200).json(user);
};
exports.show = show;
const showEmail = async (req, res) => {
    const { email } = req.params;
    const user = await (0, APIShowEmailUserService_1.default)(email);
    return res.status(200).json(user);
};
exports.showEmail = showEmail;
const update = async (req, res) => {
    // if (req.user.profile !== "admin") {
    //   throw new AppError("ERR_NO_PERMISSION", 403);
    // }
    if (process.env.DEMO === "ON") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { id: requestUserId, companyId } = req.user;
    const { userId } = req.params;
    const userData = req.body;
    const user = await (0, UpdateUserService_1.default)({
        userData,
        userId,
        companyId,
        requestUserId: +requestUserId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-user`, {
        action: "update",
        user
    });
    return res.status(200).json(user);
};
exports.update = update;
const remove = async (req, res) => {
    const { userId } = req.params;
    const { companyId, id, profile } = req.user;
    if (profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    if (process.env.DEMO === "ON") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const user = await User_1.default.findOne({
        where: { id: userId }
    });
    if (companyId !== user.companyId) {
        return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
    }
    else {
        await (0, DeleteUserService_1.default)(userId, companyId);
        const io = (0, socket_1.getIO)();
        io.of(String(companyId))
            .emit(`company-${companyId}-user`, {
            action: "delete",
            userId
        });
        return res.status(200).json({ message: "User deleted" });
    }
};
exports.remove = remove;
const list = async (req, res) => {
    const { companyId } = req.query;
    const { companyId: userCompanyId } = req.user;
    const users = await (0, SimpleListService_1.default)({
        companyId: companyId ? +companyId : userCompanyId
    });
    return res.status(200).json(users);
};
exports.list = list;
const mediaUpload = async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    try {
        let user = await User_1.default.findByPk(userId);
        user.profileImage = file.filename.replace('/', '-');
        await user.save();
        user = await (0, ShowUserService_1.default)(userId, companyId);
        const io = (0, socket_1.getIO)();
        io.of(String(companyId))
            .emit(`company-${companyId}-user`, {
            action: "update",
            user
        });
        return res.status(200).json({ user, message: "Imagem atualizada" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.mediaUpload = mediaUpload;
const toggleChangeWidht = async (req, res) => {
    var { userId } = req.params;
    const { defaultTicketsManagerWidth } = req.body;
    const { companyId } = req.user;
    const user = await (0, ToggleChangeWidthService_1.default)({ userId, defaultTicketsManagerWidth });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-user`, {
        action: "update",
        user
    });
    return res.status(200).json(user);
};
exports.toggleChangeWidht = toggleChangeWidht;
const checkEmail = async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "E-mail é obrigatório." });
    }
    const existingUser = await User_1.default.findOne({
        where: { email: email.trim().toLowerCase() }
    });
    return res.status(200).json({ exists: !!existingUser });
};
exports.checkEmail = checkEmail;
// ==================== 2FA Endpoints ====================
const setup2FA = async (req, res) => {
    const { id: userId } = req.user;
    const user = await User_1.default.findByPk(userId);
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    if (user.twoFactorEnabled) {
        throw new AppError_1.default("2FA já está ativado para este usuário.", 400);
    }
    const secret = speakeasy.generateSecret({
        name: `AtendZappy (${user.email})`,
        issuer: "AtendZappy"
    });
    // Salvar secret temporariamente (ainda não confirmado)
    await user.update({ twoFactorSecret: secret.base32 });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return res.status(200).json({
        secret: secret.base32,
        qrCode: qrCodeUrl
    });
};
exports.setup2FA = setup2FA;
const confirm2FA = async (req, res) => {
    const { id: userId } = req.user;
    const { token } = req.body;
    const user = await User_1.default.findByPk(userId);
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    if (!user.twoFactorSecret) {
        throw new AppError_1.default("Configure o 2FA primeiro.", 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1
    });
    if (!verified) {
        throw new AppError_1.default("Código inválido. Tente novamente.", 401);
    }
    await user.update({ twoFactorEnabled: true });
    return res.status(200).json({ message: "2FA ativado com sucesso!" });
};
exports.confirm2FA = confirm2FA;
const disable2FA = async (req, res) => {
    const { id: userId } = req.user;
    const { token } = req.body;
    const user = await User_1.default.findByPk(userId);
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    if (!user.twoFactorEnabled) {
        throw new AppError_1.default("2FA não está ativado.", 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1
    });
    if (!verified) {
        throw new AppError_1.default("Código inválido.", 401);
    }
    await user.update({ twoFactorSecret: null, twoFactorEnabled: false });
    return res.status(200).json({ message: "2FA desativado com sucesso!" });
};
exports.disable2FA = disable2FA;
const adminDisable2FA = async (req, res) => {
    const { userId } = req.params;
    const { companyId, profile } = req.user;
    if (profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const user = await User_1.default.findOne({
        where: { id: userId, companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    await user.update({ twoFactorSecret: null, twoFactorEnabled: false });
    return res.status(200).json({ message: "2FA desativado pelo administrador." });
};
exports.adminDisable2FA = adminDisable2FA;
