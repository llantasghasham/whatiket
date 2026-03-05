"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = __importDefault(require("../models/User"));
const Setting_1 = __importDefault(require("../models/Setting"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const ContactCustomField_1 = __importDefault(require("../models/ContactCustomField"));
const Message_1 = __importDefault(require("../models/Message"));
const Queue_1 = __importDefault(require("../models/Queue"));
const WhatsappQueue_1 = __importDefault(require("../models/WhatsappQueue"));
const UserQueue_1 = __importDefault(require("../models/UserQueue"));
const Company_1 = __importDefault(require("../models/Company"));
const Plan_1 = __importDefault(require("../models/Plan"));
const TicketNote_1 = __importDefault(require("../models/TicketNote"));
const QuickMessage_1 = __importDefault(require("../models/QuickMessage"));
const Help_1 = __importDefault(require("../models/Help"));
const TicketTraking_1 = __importDefault(require("../models/TicketTraking"));
const UserRating_1 = __importDefault(require("../models/UserRating"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Negocio_1 = __importDefault(require("../models/Negocio"));
const Produto_1 = __importDefault(require("../models/Produto"));
const ProdutoCategoria_1 = __importDefault(require("../models/ProdutoCategoria"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../models/ProdutoVariacaoOpcao"));
const ProdutoVariacaoItem_1 = __importDefault(require("../models/ProdutoVariacaoItem"));
const Ferramenta_1 = __importDefault(require("../models/Ferramenta"));
const TicketTag_1 = __importDefault(require("../models/TicketTag"));
const ContactList_1 = __importDefault(require("../models/ContactList"));
const ContactListItem_1 = __importDefault(require("../models/ContactListItem"));
const Campaign_1 = __importDefault(require("../models/Campaign"));
const CampaignSetting_1 = __importDefault(require("../models/CampaignSetting"));
const Baileys_1 = __importDefault(require("../models/Baileys"));
const CampaignShipping_1 = __importDefault(require("../models/CampaignShipping"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const Chat_1 = __importDefault(require("../models/Chat"));
const ChatUser_1 = __importDefault(require("../models/ChatUser"));
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const Chatbot_1 = __importDefault(require("../models/Chatbot"));
const DialogChatBots_1 = __importDefault(require("../models/DialogChatBots"));
const QueueIntegrations_1 = __importDefault(require("../models/QueueIntegrations"));
const Invoices_1 = __importDefault(require("../models/Invoices"));
const Fatura_1 = __importDefault(require("../models/Fatura"));
const Subscriptions_1 = __importDefault(require("../models/Subscriptions"));
const ApiUsages_1 = __importDefault(require("../models/ApiUsages"));
const Files_1 = __importDefault(require("../models/Files"));
const FilesOptions_1 = __importDefault(require("../models/FilesOptions"));
const ContactTag_1 = __importDefault(require("../models/ContactTag"));
const CompaniesSettings_1 = __importDefault(require("../models/CompaniesSettings"));
const LogTicket_1 = __importDefault(require("../models/LogTicket"));
const Prompt_1 = __importDefault(require("../models/Prompt"));
const PromptToolSetting_1 = __importDefault(require("../models/PromptToolSetting"));
const Partner_1 = __importDefault(require("../models/Partner"));
const UserPagePermission_1 = __importDefault(require("../models/UserPagePermission"));
const ContactWallet_1 = __importDefault(require("../models/ContactWallet"));
const ScheduledMessages_1 = __importDefault(require("../models/ScheduledMessages"));
const ScheduledMessagesEnvio_1 = __importDefault(require("../models/ScheduledMessagesEnvio"));
const Versions_1 = __importDefault(require("../models/Versions"));
const GoogleCalendarIntegration_1 = __importDefault(require("../models/GoogleCalendarIntegration"));
const FlowDefault_1 = require("../models/FlowDefault");
const FlowBuilder_1 = require("../models/FlowBuilder");
const FlowAudio_1 = require("../models/FlowAudio");
const FlowCampaign_1 = require("../models/FlowCampaign");
const FlowImg_1 = require("../models/FlowImg");
const Webhook_1 = require("../models/Webhook");
const MobileWebhook_1 = __importDefault(require("../models/MobileWebhook"));
const TutorialVideo_1 = __importDefault(require("../models/TutorialVideo"));
const SliderHome_1 = __importDefault(require("../models/SliderHome"));
const Profissional_1 = __importDefault(require("../models/Profissional"));
const Servico_1 = __importDefault(require("../models/Servico"));
const MediaFolder_1 = __importDefault(require("../models/MediaFolder"));
const MediaFile_1 = __importDefault(require("../models/MediaFile"));
const Automation_1 = __importDefault(require("../models/Automation"));
const AutomationAction_1 = __importDefault(require("../models/AutomationAction"));
const AutomationLog_1 = __importDefault(require("../models/AutomationLog"));
const AutomationExecution_1 = __importDefault(require("../models/AutomationExecution"));
const CrmLead_1 = __importDefault(require("../models/CrmLead"));
const CrmClient_1 = __importDefault(require("../models/CrmClient"));
const FinanceiroFatura_1 = __importDefault(require("../models/FinanceiroFatura"));
const FinanceiroPagamento_1 = __importDefault(require("../models/FinanceiroPagamento"));
const FinanceiroCategoria_1 = __importDefault(require("../models/FinanceiroCategoria"));
const FinanceiroFornecedor_1 = __importDefault(require("../models/FinanceiroFornecedor"));
const FinanceiroDespesa_1 = __importDefault(require("../models/FinanceiroDespesa"));
const FinanceiroPagamentoDespesa_1 = __importDefault(require("../models/FinanceiroPagamentoDespesa"));
const CompanyPaymentSetting_1 = __importDefault(require("../models/CompanyPaymentSetting"));
const CompanyIntegrationSetting_1 = __importDefault(require("../models/CompanyIntegrationSetting"));
const CompanyIntegrationFieldMap_1 = __importDefault(require("../models/CompanyIntegrationFieldMap"));
const CompanyApiKey_1 = __importDefault(require("../models/CompanyApiKey"));
const CrmClientContact_1 = __importDefault(require("../models/CrmClientContact"));
const ScheduledDispatcher_1 = __importDefault(require("../models/ScheduledDispatcher"));
const ScheduledDispatchLog_1 = __importDefault(require("../models/ScheduledDispatchLog"));
const Project_1 = __importDefault(require("../models/Project"));
const ProjectService_1 = __importDefault(require("../models/ProjectService"));
const ProjectProduct_1 = __importDefault(require("../models/ProjectProduct"));
const ProjectUser_1 = __importDefault(require("../models/ProjectUser"));
const ProjectTask_1 = __importDefault(require("../models/ProjectTask"));
const ProjectTaskUser_1 = __importDefault(require("../models/ProjectTaskUser"));
const UserSchedule_1 = __importDefault(require("../models/UserSchedule"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const UserService_1 = __importDefault(require("../models/UserService"));
const UserGoogleCalendarIntegration_1 = __importDefault(require("../models/UserGoogleCalendarIntegration"));
const FollowUp_1 = __importDefault(require("../models/FollowUp"));
const CallRecord_1 = __importDefault(require("../models/CallRecord"));
const GoogleSheetsToken_1 = __importDefault(require("../models/GoogleSheetsToken"));
const UserDevice_1 = __importDefault(require("../models/UserDevice"));
const Affiliate_1 = __importDefault(require("../models/Affiliate"));
const AffiliateLink_1 = __importDefault(require("../models/AffiliateLink"));
const Coupon_1 = __importDefault(require("../models/Coupon"));
const AffiliateCommission_1 = __importDefault(require("../models/AffiliateCommission"));
const AffiliateWithdrawal_1 = __importDefault(require("../models/AffiliateWithdrawal"));
const Language_1 = __importDefault(require("../models/Language"));
const Translation_1 = __importDefault(require("../models/Translation"));
const ServiceOrder_1 = __importDefault(require("../models/ServiceOrder"));
const ServiceOrderItem_1 = __importDefault(require("../models/ServiceOrderItem"));
// eslint-disable-next-line
const dbConfig = require("../config/database");
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
const models = [
    Company_1.default,
    User_1.default,
    Contact_1.default,
    ContactTag_1.default,
    Ticket_1.default,
    Message_1.default,
    Whatsapp_1.default,
    ContactCustomField_1.default,
    Setting_1.default,
    Queue_1.default,
    WhatsappQueue_1.default,
    UserQueue_1.default,
    Plan_1.default,
    TicketNote_1.default,
    QuickMessage_1.default,
    Help_1.default,
    TicketTraking_1.default,
    UserRating_1.default,
    Schedule_1.default,
    Tag_1.default,
    Negocio_1.default,
    Produto_1.default,
    ProdutoCategoria_1.default,
    ProdutoVariacaoGrupo_1.default,
    ProdutoVariacaoOpcao_1.default,
    ProdutoVariacaoItem_1.default,
    Ferramenta_1.default,
    TicketTag_1.default,
    ContactList_1.default,
    ContactListItem_1.default,
    Campaign_1.default,
    CampaignSetting_1.default,
    Baileys_1.default,
    CampaignShipping_1.default,
    Announcement_1.default,
    Chat_1.default,
    ChatUser_1.default,
    ChatMessage_1.default,
    Chatbot_1.default,
    DialogChatBots_1.default,
    QueueIntegrations_1.default,
    Invoices_1.default,
    Fatura_1.default,
    Subscriptions_1.default,
    ApiUsages_1.default,
    Files_1.default,
    FilesOptions_1.default,
    CompaniesSettings_1.default,
    LogTicket_1.default,
    Prompt_1.default,
    PromptToolSetting_1.default,
    Partner_1.default,
    ContactWallet_1.default,
    ScheduledMessages_1.default,
    ScheduledMessagesEnvio_1.default,
    Versions_1.default,
    FlowDefault_1.FlowDefaultModel,
    FlowBuilder_1.FlowBuilderModel,
    FlowAudio_1.FlowAudioModel,
    FlowCampaign_1.FlowCampaignModel,
    FlowImg_1.FlowImgModel,
    Webhook_1.WebhookModel,
    MobileWebhook_1.default,
    GoogleCalendarIntegration_1.default,
    TutorialVideo_1.default,
    SliderHome_1.default,
    Profissional_1.default,
    Servico_1.default,
    MediaFolder_1.default,
    MediaFile_1.default,
    Automation_1.default,
    AutomationAction_1.default,
    AutomationLog_1.default,
    AutomationExecution_1.default,
    CrmLead_1.default,
    CrmClient_1.default,
    FinanceiroFatura_1.default,
    FinanceiroPagamento_1.default,
    FinanceiroCategoria_1.default,
    FinanceiroFornecedor_1.default,
    FinanceiroDespesa_1.default,
    FinanceiroPagamentoDespesa_1.default,
    CompanyPaymentSetting_1.default,
    CompanyIntegrationSetting_1.default,
    CompanyIntegrationFieldMap_1.default,
    CompanyApiKey_1.default,
    CrmClientContact_1.default,
    ScheduledDispatcher_1.default,
    ScheduledDispatchLog_1.default,
    Project_1.default,
    ProjectService_1.default,
    ProjectProduct_1.default,
    ProjectUser_1.default,
    ProjectTask_1.default,
    ProjectTaskUser_1.default,
    UserSchedule_1.default,
    Appointment_1.default,
    UserService_1.default,
    UserGoogleCalendarIntegration_1.default,
    FollowUp_1.default,
    GoogleSheetsToken_1.default,
    UserDevice_1.default,
    CallRecord_1.default,
    Affiliate_1.default,
    AffiliateLink_1.default,
    Coupon_1.default,
    AffiliateCommission_1.default,
    AffiliateWithdrawal_1.default,
    Language_1.default,
    Translation_1.default,
    ServiceOrder_1.default,
    ServiceOrderItem_1.default,
    UserPagePermission_1.default,
];
sequelize.addModels(models);
exports.default = sequelize;
