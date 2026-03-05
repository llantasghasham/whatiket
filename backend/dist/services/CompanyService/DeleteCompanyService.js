"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Company_1 = __importDefault(require("../../models/Company"));
const User_1 = __importDefault(require("../../models/User"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Message_1 = __importDefault(require("../../models/Message"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const TicketTraking_1 = __importDefault(require("../../models/TicketTraking"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Invoices_1 = __importDefault(require("../../models/Invoices"));
const UserRating_1 = __importDefault(require("../../models/UserRating"));
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const PromptToolSetting_1 = __importDefault(require("../../models/PromptToolSetting"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const ContactWallet_1 = __importDefault(require("../../models/ContactWallet"));
const ContactCustomField_1 = __importDefault(require("../../models/ContactCustomField"));
const ContactList_1 = __importDefault(require("../../models/ContactList"));
const ContactListItem_1 = __importDefault(require("../../models/ContactListItem"));
const Campaign_1 = __importDefault(require("../../models/Campaign"));
const CampaignSetting_1 = __importDefault(require("../../models/CampaignSetting"));
const CampaignShipping_1 = __importDefault(require("../../models/CampaignShipping"));
const Chat_1 = __importDefault(require("../../models/Chat"));
const ChatMessage_1 = __importDefault(require("../../models/ChatMessage"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const DialogChatBots_1 = __importDefault(require("../../models/DialogChatBots"));
const Announcement_1 = __importDefault(require("../../models/Announcement"));
const QuickMessage_1 = __importDefault(require("../../models/QuickMessage"));
const Schedule_1 = __importDefault(require("../../models/Schedule"));
const ScheduledMessages_1 = __importDefault(require("../../models/ScheduledMessages"));
const ScheduledMessagesEnvio_1 = __importDefault(require("../../models/ScheduledMessagesEnvio"));
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const ScheduledDispatchLog_1 = __importDefault(require("../../models/ScheduledDispatchLog"));
const database_1 = __importDefault(require("../../database"));
const QueueIntegrations_1 = __importDefault(require("../../models/QueueIntegrations"));
const FlowBuilder_1 = require("../../models/FlowBuilder");
const FlowCampaign_1 = require("../../models/FlowCampaign");
const FlowDefault_1 = require("../../models/FlowDefault");
const FlowAudio_1 = require("../../models/FlowAudio");
const FlowImg_1 = require("../../models/FlowImg");
const Files_1 = __importDefault(require("../../models/Files"));
const Fatura_1 = __importDefault(require("../../models/Fatura"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const Ferramenta_1 = __importDefault(require("../../models/Ferramenta"));
const Negocio_1 = __importDefault(require("../../models/Negocio"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const Profissional_1 = __importDefault(require("../../models/Profissional"));
const Project_1 = __importDefault(require("../../models/Project"));
const ProjectUser_1 = __importDefault(require("../../models/ProjectUser"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const ProjectTaskUser_1 = __importDefault(require("../../models/ProjectTaskUser"));
const ProjectProduct_1 = __importDefault(require("../../models/ProjectProduct"));
const ProjectService_1 = __importDefault(require("../../models/ProjectService"));
const Automation_1 = __importDefault(require("../../models/Automation"));
const IaWorkflow_1 = __importDefault(require("../../models/IaWorkflow"));
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const CallRecord_1 = __importDefault(require("../../models/CallRecord"));
const ApiUsages_1 = __importDefault(require("../../models/ApiUsages"));
const CompanyApiKey_1 = __importDefault(require("../../models/CompanyApiKey"));
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const CompanyPaymentSetting_1 = __importDefault(require("../../models/CompanyPaymentSetting"));
const GoogleCalendarIntegration_1 = __importDefault(require("../../models/GoogleCalendarIntegration"));
const GoogleSheetsToken_1 = __importDefault(require("../../models/GoogleSheetsToken"));
const MediaFile_1 = __importDefault(require("../../models/MediaFile"));
const MediaFolder_1 = __importDefault(require("../../models/MediaFolder"));
const MobileWebhook_1 = __importDefault(require("../../models/MobileWebhook"));
const Subscriptions_1 = __importDefault(require("../../models/Subscriptions"));
const SliderHome_1 = __importDefault(require("../../models/SliderHome"));
const TutorialVideo_1 = __importDefault(require("../../models/TutorialVideo"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const CrmClientContact_1 = __importDefault(require("../../models/CrmClientContact"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const Baileys_1 = __importDefault(require("../../models/Baileys"));
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const DeleteCompanyService = async (id) => {
    console.log("🗑️ INICIANDO EXCLUSÃO DA EMPRESA NO BACKEND:", id);
    const company = await Company_1.default.findOne({
        where: { id }
    });
    if (!company) {
        console.log("❌ Empresa não encontrada:", id);
        throw new AppError_1.default("ERR_NO_COMPANY_FOUND", 404);
    }
    console.log("✅ Empresa encontrada:", company.name);
    console.log("🧹 Removendo dados relacionados...");
    const runSafeDestroy = async (label, destroyFn) => {
        try {
            const result = await destroyFn();
            console.log(`✔️  ${label} removidos (${result || 0})`);
        }
        catch (error) {
            console.log(`⚠️  Falha ao remover ${label}:`, error?.message || error);
        }
    };
    try {
        // 1. Tabelas dependentes de Ticket (devem ser removidas antes de Tickets)
        await runSafeDestroy("UserRatings", async () => UserRating_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("TicketTrakings", async () => TicketTraking_1.default.destroy({ where: { companyId: id } }));
        // 2. Mensagens
        await runSafeDestroy("Messages", async () => Message_1.default.destroy({ where: { companyId: id } }));
        // 3. Tickets
        await runSafeDestroy("Tickets", async () => Ticket_1.default.destroy({ where: { companyId: id } }));
        // 4. Contatos e relacionados
        await runSafeDestroy("ContactTags", async () => {
            const contacts = await Contact_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const contactIds = contacts.map(c => c.id);
            if (contactIds.length > 0) {
                await ContactTag_1.default.destroy({ where: { contactId: { [sequelize_1.Op.in]: contactIds } } });
                await ContactCustomField_1.default.destroy({ where: { contactId: { [sequelize_1.Op.in]: contactIds } } });
            }
            return contactIds.length;
        });
        await runSafeDestroy("ContactWallets", async () => ContactWallet_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ContactListItems", async () => ContactListItem_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ContactLists", async () => ContactList_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Contacts", async () => Contact_1.default.destroy({ where: { companyId: id } }));
        // 5. Tags
        await runSafeDestroy("Tags", async () => Tag_1.default.destroy({ where: { companyId: id } }));
        // 6. Campanhas
        await runSafeDestroy("CampaignShippings", async () => {
            const campaigns = await Campaign_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const campaignIds = campaigns.map(c => c.id);
            if (campaignIds.length > 0) {
                return CampaignShipping_1.default.destroy({ where: { campaignId: { [sequelize_1.Op.in]: campaignIds } } });
            }
            return 0;
        });
        await runSafeDestroy("CampaignSettings", async () => CampaignSetting_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Campaigns", async () => Campaign_1.default.destroy({ where: { companyId: id } }));
        // 7. Chat interno
        await runSafeDestroy("ChatMessages", async () => {
            const chats = await Chat_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const chatIds = chats.map(c => c.id);
            if (chatIds.length > 0) {
                return ChatMessage_1.default.destroy({ where: { chatId: { [sequelize_1.Op.in]: chatIds } } });
            }
            return 0;
        });
        await runSafeDestroy("Chats", async () => Chat_1.default.destroy({ where: { companyId: id } }));
        // 8. Chatbots e DialogChatBots
        await runSafeDestroy("DialogChatBots/Chatbots", async () => {
            const queues = await Queue_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const queueIds = queues.map(q => q.id);
            if (queueIds.length > 0) {
                const chatbots = await Chatbot_1.default.findAll({ where: { queueId: { [sequelize_1.Op.in]: queueIds } }, attributes: ["id"] });
                const chatbotIds = chatbots.map(cb => cb.id);
                if (chatbotIds.length > 0) {
                    await DialogChatBots_1.default.destroy({ where: { chatbotId: { [sequelize_1.Op.in]: chatbotIds } } });
                }
                await Chatbot_1.default.destroy({ where: { queueId: { [sequelize_1.Op.in]: queueIds } } });
            }
            return 0;
        });
        // 9. Agendamentos
        await runSafeDestroy("ScheduledDispatchLogs", async () => ScheduledDispatchLog_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ScheduledDispatchers", async () => ScheduledDispatcher_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ScheduledMessagesEnvios", async () => ScheduledMessagesEnvio_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ScheduledMessages", async () => ScheduledMessages_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Schedules", async () => Schedule_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Appointments", async () => Appointment_1.default.destroy({ where: { companyId: id } }));
        // 10. FlowBuilder (uses company_id snake_case)
        await runSafeDestroy("FlowCampaigns", async () => FlowCampaign_1.FlowCampaignModel.destroy({ where: { companyId: id } }));
        await runSafeDestroy("FlowDefaults", async () => FlowDefault_1.FlowDefaultModel.destroy({ where: { companyId: id } }));
        await runSafeDestroy("FlowAudios", async () => FlowAudio_1.FlowAudioModel.destroy({ where: { companyId: id } }));
        await runSafeDestroy("FlowImgs", async () => FlowImg_1.FlowImgModel.destroy({ where: { companyId: id } }));
        await runSafeDestroy("FlowBuilders", async () => FlowBuilder_1.FlowBuilderModel.destroy({ where: { company_id: id } }));
        // 11. Integrações (Integrations not registered in Sequelize - use raw query)
        await runSafeDestroy("QueueIntegrations", async () => QueueIntegrations_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Integrations", async () => {
            const [, result] = await database_1.default.query(`DELETE FROM "Integrations" WHERE "companyId" = ${Number(id)}`);
            return result;
        });
        await runSafeDestroy("CompanyIntegrationSettings", async () => CompanyIntegrationSetting_1.default.destroy({ where: { companyId: id } }));
        // 12. IA e Prompts (Prompts deleted AFTER Whatsapps due to FK Whatsapps_promptId_fkey)
        await runSafeDestroy("PromptToolSettings", async () => PromptToolSetting_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("IaWorkflows", async () => IaWorkflow_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Automations", async () => Automation_1.default.destroy({ where: { companyId: id } }));
        // 13. Projetos
        await runSafeDestroy("ProjectTaskUsers", async () => ProjectTaskUser_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ProjectTasks", async () => ProjectTask_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ProjectProducts", async () => ProjectProduct_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ProjectServices", async () => ProjectService_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ProjectUsers", async () => ProjectUser_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Projects", async () => Project_1.default.destroy({ where: { companyId: id } }));
        // 14. Financeiro
        await runSafeDestroy("FinanceiroPagamentos", async () => FinanceiroPagamento_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("FinanceiroFaturas", async () => FinanceiroFatura_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Faturas", async () => Fatura_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Invoices", async () => Invoices_1.default.destroy({ where: { companyId: id } }));
        // 15. CRM
        await runSafeDestroy("CrmClientContacts", async () => {
            const clients = await CrmClient_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const clientIds = clients.map(c => c.id);
            if (clientIds.length > 0) {
                return CrmClientContact_1.default.destroy({ where: { clientId: { [sequelize_1.Op.in]: clientIds } } });
            }
            return 0;
        });
        await runSafeDestroy("CrmClients", async () => CrmClient_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("CrmLeads", async () => CrmLead_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Negocios", async () => Negocio_1.default.destroy({ where: { companyId: id } }));
        // 16. Produtos e Serviços
        await runSafeDestroy("Produtos", async () => Produto_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Servicos", async () => Servico_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Profissionais", async () => Profissional_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Ferramentas", async () => Ferramenta_1.default.destroy({ where: { companyId: id } }));
        // 17. Mídia e Arquivos
        await runSafeDestroy("MediaFiles", async () => MediaFile_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("MediaFolders", async () => MediaFolder_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Files", async () => Files_1.default.destroy({ where: { companyId: id } }));
        // 18. Diversos
        await runSafeDestroy("Announcements", async () => Announcement_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("QuickMessages", async () => QuickMessage_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("CallRecords", async () => CallRecord_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("ApiUsages", async () => ApiUsages_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("MobileWebhooks", async () => MobileWebhook_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Subscriptions", async () => Subscriptions_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("SliderBanners", async () => {
            const [, result] = await database_1.default.query(`DELETE FROM "SliderBanners" WHERE "companyId" = ${Number(id)}`);
            return result;
        });
        await runSafeDestroy("SliderHomes", async () => SliderHome_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("TutorialVideos", async () => TutorialVideo_1.default.destroy({ where: { companyId: id } }));
        // 19. Google
        await runSafeDestroy("UserGoogleCalendarIntegrations", async () => UserGoogleCalendarIntegration_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("GoogleCalendarIntegrations", async () => GoogleCalendarIntegration_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("GoogleSheetsTokens", async () => GoogleSheetsToken_1.default.destroy({ where: { companyId: id } }));
        // 20. Configurações da empresa
        await runSafeDestroy("CompanyApiKeys", async () => CompanyApiKey_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("CompanyPaymentSettings", async () => CompanyPaymentSetting_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("CompaniesSettings", async () => CompaniesSettings_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Settings", async () => Setting_1.default.destroy({ where: { companyId: id } }));
        // 21. Baileys (sessões WhatsApp da empresa)
        await runSafeDestroy("Baileys", async () => {
            const whatsapps = await Whatsapp_1.default.findAll({ where: { companyId: id }, attributes: ["id"] });
            const whatsappIds = whatsapps.map(w => w.id);
            if (whatsappIds.length > 0) {
                return Baileys_1.default.destroy({ where: { whatsappId: whatsappIds } });
            }
            return 0;
        });
        // 22. Conexões WhatsApp (must be before Prompts due to FK Whatsapps_promptId_fkey)
        await runSafeDestroy("Whatsapps", async () => Whatsapp_1.default.destroy({ where: { companyId: id } }));
        // 23. Prompts (after Whatsapps, before Queues due to FK Prompts_queueId_fkey)
        await runSafeDestroy("Prompts", async () => Prompt_1.default.destroy({ where: { companyId: id } }));
        // 24. Filas (after Prompts due to FK Prompts_queueId_fkey)
        await runSafeDestroy("Queues", async () => Queue_1.default.destroy({ where: { companyId: id } }));
        // 25. Usuários
        await runSafeDestroy("UserSchedules", async () => UserSchedule_1.default.destroy({ where: { companyId: id } }));
        await runSafeDestroy("Users", async () => User_1.default.destroy({ where: { companyId: id } }));
        // 25. Remover pasta pública da empresa
        const companyPublicFolder = path_1.default.join(publicFolder, `company${id}`);
        try {
            if (fs_1.default.existsSync(companyPublicFolder)) {
                fs_1.default.rmSync(companyPublicFolder, { recursive: true, force: true });
                console.log(`✔️  Pasta pública removida: ${companyPublicFolder}`);
            }
            else {
                console.log(`ℹ️  Pasta pública não encontrada: ${companyPublicFolder}`);
            }
        }
        catch (error) {
            console.log(`⚠️  Falha ao remover pasta pública:`, error?.message || error);
        }
        // 26. Remover a empresa
        console.log("🗑️ Removendo a empresa...");
        await company.destroy();
        console.log("✅ Empresa excluída com sucesso!");
    }
    catch (error) {
        console.log("❌ ERRO durante a exclusão:", error.message);
        throw new AppError_1.default(`Erro ao excluir empresa: ${error.message}`, 500);
    }
};
exports.default = DeleteCompanyService;
