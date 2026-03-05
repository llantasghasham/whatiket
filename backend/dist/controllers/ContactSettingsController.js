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
exports.resetSettings = exports.testConfiguration = exports.batchSaveToPhone = exports.getStats = exports.update = exports.index = void 0;
const CompaniesSettings_1 = __importDefault(require("../models/CompaniesSettings"));
const socket_1 = require("../libs/socket");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const ContactScoringService_1 = require("../services/ContactServices/ContactScoringService");
const ContactPhoneService_1 = require("../services/ContactServices/ContactPhoneService");
const Contact_1 = __importDefault(require("../models/Contact"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const index = async (req, res) => {
    try {
        const { companyId } = req.user;
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        if (!settings) {
            // Criar configurações padrão se não existir
            const defaultSettings = await CompaniesSettings_1.default.create({
                companyId,
                autoSaveContacts: "disabled",
                autoSaveContactsScore: 7,
                autoSaveContactsReason: "high_potential"
            });
            return res.status(200).json({
                autoSaveContacts: defaultSettings.autoSaveContacts,
                autoSaveContactsScore: defaultSettings.autoSaveContactsScore,
                autoSaveContactsReason: defaultSettings.autoSaveContactsReason
            });
        }
        return res.status(200).json({
            autoSaveContacts: settings.autoSaveContacts,
            autoSaveContactsScore: settings.autoSaveContactsScore,
            autoSaveContactsReason: settings.autoSaveContactsReason
        });
    }
    catch (error) {
        logger_1.default.error("Error getting contact settings:", error);
        throw new AppError_1.default("ERR_GET_CONTACT_SETTINGS", 500);
    }
};
exports.index = index;
const update = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { autoSaveContacts, autoSaveContactsScore, autoSaveContactsReason } = req.body;
        logger_1.default.info("=== UPDATE CONTACT SETTINGS START ===");
        logger_1.default.info("Request body:", {
            autoSaveContacts,
            autoSaveContactsScore,
            autoSaveContactsReason,
            companyId
        });
        // Validações
        if (autoSaveContacts && !["disabled", "enabled", "all", "important"].includes(autoSaveContacts)) {
            throw new AppError_1.default("Invalid autoSaveContacts value", 400);
        }
        if (autoSaveContactsScore && (autoSaveContactsScore < 0 || autoSaveContactsScore > 10)) {
            throw new AppError_1.default("autoSaveContactsScore must be between 0 and 10", 400);
        }
        if (autoSaveContactsReason && !["high_potential", "message_analysis", "business_hours"].includes(autoSaveContactsReason)) {
            throw new AppError_1.default("Invalid autoSaveContactsReason value", 400);
        }
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        if (!settings) {
            // Criar se não existir
            const newSettings = await CompaniesSettings_1.default.create({
                companyId,
                autoSaveContacts: autoSaveContacts || "enabled",
                autoSaveContactsScore: autoSaveContactsScore || 7,
                autoSaveContactsReason: autoSaveContactsReason || "high_potential"
            });
        }
        else {
            // Atualizar se existir
            logger_1.default.info("Updating existing settings");
            await settings.update({
                autoSaveContacts: autoSaveContacts,
                autoSaveContactsScore: autoSaveContactsScore,
                autoSaveContactsReason: autoSaveContactsReason
            });
            logger_1.default.info("Settings updated in database");
        }
        // Emitir evento para atualização em tempo real
        const io = (0, socket_1.getIO)();
        io.of(String(companyId)).emit(`company-${companyId}-contactSettings`, {
            action: "update",
            settings: {
                autoSaveContacts,
                autoSaveContactsScore,
                autoSaveContactsReason
            }
        });
        logger_1.default.info(`Contact settings updated for company ${companyId}`);
        // Retornar o objeto settings completo atualizado
        const updatedSettings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        logger_1.default.info("Updated settings from database:", updatedSettings?.get());
        return res.status(200).json({
            message: "Settings updated successfully",
            settings: updatedSettings
        });
    }
    catch (error) {
        logger_1.default.error("Error updating contact settings:", error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default("ERR_UPDATE_CONTACT_SETTINGS", 500);
    }
};
exports.update = update;
const getStats = async (req, res) => {
    try {
        const { companyId } = req.user;
        // Buscar configurações da empresa
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        // Buscar estatísticas de contatos
        const contactStats = await (0, ContactScoringService_1.GetContactStats)(companyId);
        // Buscar estatísticas de salvamento no celular
        const phoneStats = await (0, ContactPhoneService_1.GetPhoneSavingStats)(companyId);
        // Buscar contatos de alto potencial
        const highPotentialContacts = await (0, ContactScoringService_1.GetHighPotentialContacts)(companyId, 10);
        return res.status(200).json({
            settings: {
                autoSaveContacts: settings?.autoSaveContacts || "disabled",
                autoSaveContactsScore: settings?.autoSaveContactsScore || 7,
                autoSaveContactsReason: settings?.autoSaveContactsReason || "high_potential"
            },
            contactStats,
            phoneStats,
            highPotentialContacts: highPotentialContacts.map(contact => ({
                id: contact.id,
                name: contact.name,
                number: contact.number,
                potentialScore: contact.potentialScore,
                isPotential: contact.isPotential,
                savedToPhone: contact.savedToPhone,
                createdAt: contact.createdAt
            }))
        });
    }
    catch (error) {
        logger_1.default.error("Error getting contact stats:", error);
        throw new AppError_1.default("ERR_GET_CONTACT_STATS", 500);
    }
};
exports.getStats = getStats;
const batchSaveToPhone = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { contactIds } = req.body;
        if (!contactIds || !Array.isArray(contactIds)) {
            throw new AppError_1.default("contactIds must be an array", 400);
        }
        if (contactIds.length === 0) {
            throw new AppError_1.default("contactIds cannot be empty", 400);
        }
        if (contactIds.length > 100) {
            throw new AppError_1.default("Maximum 100 contacts per batch", 400);
        }
        // Buscar contatos
        const contacts = await Contact_1.default.findAll({
            where: {
                id: contactIds,
                companyId,
                savedToPhone: false // Apenas contatos não salvos
            }
        });
        if (contacts.length === 0) {
            return res.status(200).json({
                message: "No contacts to save (all already saved or not found)",
                success: 0,
                failed: 0
            });
        }
        // Obter whatsappId padrão usando método padrão do sistema
        const defaultWhatsapp = await Whatsapp_1.default.findOne({
            where: {
                companyId,
                isDefault: true
            }
        });
        if (!defaultWhatsapp) {
            throw new AppError_1.default("No default WhatsApp connection found", 400);
        }
        const whatsappId = defaultWhatsapp.id;
        // Salvar contatos em lote
        const result = await (0, ContactPhoneService_1.BatchSaveContactsToPhone)(contacts, whatsappId, companyId);
        logger_1.default.info(`Batch save completed for company ${companyId}: ${result.success} success, ${result.failed} failed`);
        return res.status(200).json({
            message: "Batch save completed",
            success: result.success,
            failed: result.failed,
            total: contacts.length
        });
    }
    catch (error) {
        logger_1.default.error("Error in batch save to phone:", error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default("ERR_BATCH_SAVE_TO_PHONE", 500);
    }
};
exports.batchSaveToPhone = batchSaveToPhone;
const testConfiguration = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { testMessage } = req.body;
        if (!testMessage) {
            throw new AppError_1.default("testMessage is required", 400);
        }
        // Importar CalculatePotentialScore para teste
        const { CalculatePotentialScore } = await Promise.resolve().then(() => __importStar(require("../services/ContactServices/ContactScoringService")));
        const score = CalculatePotentialScore(testMessage);
        const isPotential = score >= 5;
        // Buscar configurações atuais
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        const wouldSave = settings?.autoSaveContacts === "enabled" && score >= (settings?.autoSaveContactsScore || 7);
        return res.status(200).json({
            testMessage,
            score,
            isPotential,
            wouldSave,
            currentSettings: {
                autoSaveContacts: settings?.autoSaveContacts || "enabled",
                autoSaveContactsScore: settings?.autoSaveContactsScore || 7,
                autoSaveContactsReason: settings?.autoSaveContactsReason || "high_potential"
            }
        });
    }
    catch (error) {
        logger_1.default.error("Error testing configuration:", error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default("ERR_TEST_CONFIGURATION", 500);
    }
};
exports.testConfiguration = testConfiguration;
const resetSettings = async (req, res) => {
    try {
        const { companyId } = req.user;
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        if (!settings) {
            throw new AppError_1.default("Settings not found", 404);
        }
        // Resetar para valores padrão
        await settings.update({
            autoSaveContacts: "enabled",
            autoSaveContactsScore: 7,
            autoSaveContactsReason: "high_potential"
        });
        // Emitir evento de atualização
        const io = (0, socket_1.getIO)();
        io.of(String(companyId)).emit(`company-${companyId}-contactSettings`, {
            action: "reset",
            settings: {
                autoSaveContacts: "enabled",
                autoSaveContactsScore: 7,
                autoSaveContactsReason: "high_potential"
            }
        });
        logger_1.default.info(`Contact settings reset for company ${companyId}`);
        return res.status(200).json({
            message: "Settings reset to default values",
            autoSaveContacts: "enabled",
            autoSaveContactsScore: 7,
            autoSaveContactsReason: "high_potential"
        });
    }
    catch (error) {
        logger_1.default.error("Error resetting contact settings:", error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default("ERR_RESET_CONTACT_SETTINGS", 500);
    }
};
exports.resetSettings = resetSettings;
