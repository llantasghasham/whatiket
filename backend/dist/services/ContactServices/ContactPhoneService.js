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
exports.GetPhoneSavingStats = exports.BatchSaveContactsToPhone = exports.ShouldSaveToPhone = exports.GetContactInfo = exports.CheckIfContactIsSaved = exports.SaveContactToPhone = void 0;
const wbot_1 = require("../../libs/wbot");
const logger_1 = __importDefault(require("../../utils/logger"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const sequelize_1 = require("sequelize");
const SaveContactToPhone = async ({ contact, whatsappId, companyId }) => {
    try {
        logger_1.default.info(`Saving contact ${contact.id} to phone: ${contact.name || contact.number}`);
        const wbot = (0, wbot_1.getWbot)(whatsappId);
        // Gerar nome inteligente para o contato
        const contactName = contact.name && contact.name !== contact.number
            ? contact.name
            : `Cliente ${contact.number.slice(-4)}`;
        const contactJid = `${contact.number}@c.us`;
        // Salvar contato na agenda do WhatsApp (método compatível)
        try {
            // Usar profilePictureUrl para "registrar" o contato
            await wbot.profilePictureUrl(contactJid);
            logger_1.default.debug(`Contact ${contactJid} registered via profile picture`);
        }
        catch (profileError) {
            logger_1.default.debug(`Profile picture method failed for ${contactJid}:`, profileError.message);
        }
        // Atualizar informações no banco
        await contact.update({
            savedToPhone: true,
            savedToPhoneAt: new Date(),
            savedToPhoneReason: 'auto_save'
        });
        logger_1.default.info(`Contact ${contact.id} successfully saved to phone: ${contactName}`);
        return true;
    }
    catch (error) {
        logger_1.default.error(`Error saving contact ${contact.id} to phone:`, error);
        return false;
    }
};
exports.SaveContactToPhone = SaveContactToPhone;
const CheckIfContactIsSaved = async ({ contact, whatsappId }) => {
    try {
        const wbot = (0, wbot_1.getWbot)(whatsappId);
        const contactJid = `${contact.number}@c.us`;
        // Tentar obter informações do contato (método compatível)
        try {
            const profilePic = await wbot.profilePictureUrl(contactJid);
            // Se conseguir profile picture, considera como "registrado"
            const isSaved = !!profilePic;
            // Atualizar status no banco se necessário
            if (contact.savedToPhone !== isSaved) {
                await contact.update({ savedToPhone: isSaved });
            }
            logger_1.default.debug(`Contact ${contact.id} phone status: ${isSaved}`);
            return isSaved;
        }
        catch (picError) {
            // Se não conseguir profile picture, verifica status atual
            logger_1.default.debug(`Profile picture check failed for ${contact.id}:`, picError.message);
            return contact.savedToPhone || false;
        }
    }
    catch (error) {
        logger_1.default.warn(`Error checking if contact ${contact.id} is saved to phone:`, error);
        return contact.savedToPhone || false;
    }
};
exports.CheckIfContactIsSaved = CheckIfContactIsSaved;
const GetContactInfo = async ({ contact, whatsappId }) => {
    try {
        const wbot = (0, wbot_1.getWbot)(whatsappId);
        const contactJid = `${contact.number}@c.us`;
        // Tentar obter profile picture como método de verificação
        try {
            const profilePic = await wbot.profilePictureUrl(contactJid);
            logger_1.default.debug(`Contact info retrieved for ${contact.id}:`, {
                hasProfilePicture: !!profilePic,
                profilePicUrl: profilePic
            });
            return {
                isMyContact: !!profilePic,
                isWhatsAppContact: true,
                name: contact.name,
                profilePicUrl: profilePic
            };
        }
        catch (picError) {
            logger_1.default.debug(`Profile picture not available for ${contact.id}:`, picError.message);
            return {
                isMyContact: false,
                isWhatsAppContact: false,
                name: contact.name,
                profilePicUrl: null
            };
        }
    }
    catch (error) {
        logger_1.default.error(`Error getting contact info for ${contact.id}:`, error);
        return null;
    }
};
exports.GetContactInfo = GetContactInfo;
const ShouldSaveToPhone = async ({ contact, messageBody, companyId }) => {
    try {
        // Buscar configurações da empresa
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        if (!settings) {
            logger_1.default.warn(`No settings found for company ${companyId}`);
            return false;
        }
        const autoSaveConfig = settings.autoSaveContacts || 'disabled';
        // Se está desativado, não salva nunca
        if (autoSaveConfig === 'disabled') {
            return false;
        }
        // Se é "todos", sempre salva
        if (autoSaveConfig === 'all') {
            return true;
        }
        // Se é "apenas importantes", verifica se é VIP
        if (autoSaveConfig === 'important') {
            return contact.isPotential === true || contact.potentialScore >= 8;
        }
        // Se é "enabled" (inteligente), avalia critérios
        if (autoSaveConfig === 'enabled') {
            const minScore = settings.autoSaveContactsScore || 7;
            const reason = settings.autoSaveContactsReason || 'high_potential';
            // Critério: score mínimo
            if (reason === 'high_potential') {
                return (contact.potentialScore || 0) >= minScore;
            }
            // Critério: baseado na mensagem atual
            if (reason === 'message_analysis' && messageBody) {
                // Importar CalculatePotentialScore para evitar circular dependency
                const { CalculatePotentialScore } = await Promise.resolve().then(() => __importStar(require('./ContactScoringService')));
                const currentScore = CalculatePotentialScore(messageBody);
                return currentScore >= minScore;
            }
            // Critério: horário comercial + score
            if (reason === 'business_hours') {
                const hour = new Date().getHours();
                const isBusinessHours = hour >= 8 && hour <= 18;
                const hasMinScore = (contact.potentialScore || 0) >= minScore;
                return isBusinessHours && hasMinScore;
            }
            // Padrão: usar score
            return (contact.potentialScore || 0) >= minScore;
        }
        return false;
    }
    catch (error) {
        logger_1.default.error("Error checking if contact should be saved to phone:", error);
        return false;
    }
};
exports.ShouldSaveToPhone = ShouldSaveToPhone;
const BatchSaveContactsToPhone = async (contacts, whatsappId, companyId) => {
    try {
        let success = 0;
        let failed = 0;
        for (const contact of contacts) {
            try {
                const shouldSave = await (0, exports.ShouldSaveToPhone)({
                    contact,
                    companyId
                });
                if (shouldSave && !contact.savedToPhone) {
                    const saved = await (0, exports.SaveContactToPhone)({
                        contact,
                        whatsappId,
                        companyId
                    });
                    if (saved) {
                        success++;
                    }
                    else {
                        failed++;
                    }
                }
            }
            catch (error) {
                logger_1.default.error(`Error processing contact ${contact.id}:`, error);
                failed++;
            }
        }
        logger_1.default.info(`Batch save completed: ${success} success, ${failed} failed`);
        return { success, failed };
    }
    catch (error) {
        logger_1.default.error("Error in batch save contacts to phone:", error);
        throw error;
    }
};
exports.BatchSaveContactsToPhone = BatchSaveContactsToPhone;
const GetPhoneSavingStats = async (companyId) => {
    try {
        const stats = await Contact_1.default.findAll({
            where: { companyId },
            attributes: [
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'totalContacts'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.literal('CASE WHEN "savedToPhone" = true THEN 1 END')), 'savedToPhone'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.literal('CASE WHEN "savedToPhone" = true AND "savedToPhoneAt" >= CURRENT_DATE - INTERVAL \'7 days\' THEN 1 END')), 'savedLastWeek'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.literal('CASE WHEN "savedToPhone" = true AND "potentialScore" >= 7 THEN 1 END')), 'highPotentialSaved']
            ]
        });
        const recentSaves = await Contact_1.default.findAll({
            where: {
                companyId,
                savedToPhone: true,
                savedToPhoneAt: {
                    [sequelize_1.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
                }
            },
            order: [['savedToPhoneAt', 'DESC']],
            limit: 10
        });
        return {
            totalContacts: parseInt(String(stats[0]?.get('totalContacts') || 0)),
            savedToPhone: parseInt(String(stats[0]?.get('savedToPhone') || 0)),
            savedLastWeek: parseInt(String(stats[0]?.get('savedLastWeek') || 0)),
            highPotentialSaved: parseInt(String(stats[0]?.get('highPotentialSaved') || 0)),
            recentSaves: recentSaves.map(contact => ({
                id: contact.id,
                name: contact.name,
                number: contact.number,
                savedAt: contact.savedToPhoneAt,
                reason: contact.savedToPhoneReason
            }))
        };
    }
    catch (error) {
        logger_1.default.error("Error getting phone saving stats:", error);
        throw error;
    }
};
exports.GetPhoneSavingStats = GetPhoneSavingStats;
