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
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Company_1 = __importDefault(require("../../models/Company"));
const User_1 = __importDefault(require("../../models/User"));
const database_1 = __importDefault(require("../../database"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const CreateCompanyService = async (companyData) => {
    const { name, phone, password, email, status, planId, dueDate, recurrence, document, paymentMethod, companyUserName, campaignsEnabled, type, segment, referredBy, couponId, affiliateId, affiliateLinkId } = companyData;
    const companySchema = Yup.object().shape({
        name: Yup.string()
            .min(2, "ERR_COMPANY_INVALID_NAME")
            .required("ERR_COMPANY_INVALID_NAME")
    });
    try {
        await companySchema.validate({ name });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const t = await database_1.default.transaction();
    try {
        const company = await Company_1.default.create({
            name,
            phone,
            email,
            status,
            planId,
            dueDate,
            recurrence,
            document,
            paymentMethod,
            type,
            segment,
            referredBy: referredBy || null,
            couponId: couponId || null,
            affiliateId: affiliateId || null,
            affiliateLinkId: affiliateLinkId || null
        }, { transaction: t });
        const user = await User_1.default.create({
            name: companyUserName ? companyUserName : name,
            email: company.email,
            password: password ? password : "mudar123",
            profile: "admin",
            userType: "admin",
            companyId: company.id
        }, { transaction: t });
        const settings = await CompaniesSettings_1.default.create({
            companyId: company.id,
            hoursCloseTicketsAuto: "9999999999",
            chatBotType: "text",
            acceptCallWhatsapp: "enabled",
            userRandom: "enabled",
            sendGreetingMessageOneQueues: "enabled",
            sendSignMessage: "enabled",
            sendFarewellWaitingTicket: "disabled",
            userRating: "disabled",
            sendGreetingAccepted: "enabled",
            CheckMsgIsGroup: "enabled",
            sendQueuePosition: "disabled",
            scheduleType: "disabled",
            acceptAudioMessageContact: "enabled",
            sendMsgTransfTicket: "disabled",
            enableLGPD: "disabled",
            requiredTag: "disabled",
            lgpdDeleteMessage: "disabled",
            lgpdHideNumber: "disabled",
            lgpdConsent: "disabled",
            lgpdLink: "",
            lgpdMessage: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            closeTicketOnTransfer: false,
            DirectTicketsToWallets: false
        }, { transaction: t });
        if (typeof campaignsEnabled === "boolean") {
            await Setting_1.default.create({
                key: "campaignsEnabled",
                value: `${campaignsEnabled}`,
                companyId: company.id
            }, { transaction: t });
        }
        await t.commit();
        return company;
    }
    catch (error) {
        await t.rollback();
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError_1.default("ERR_EMAIL_ALREADY_EXISTS", 400);
        }
        throw new AppError_1.default("Não foi possível criar a empresa!", 500);
    }
};
exports.default = CreateCompanyService;
