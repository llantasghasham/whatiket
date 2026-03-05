"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNoResponseAutomationJob = exports.runKanbanAutomationJob = exports.runBirthdayAutomationJob = exports.runAutomationJob = exports.executeScheduledAutomations = void 0;
const sequelize_1 = require("sequelize");
const Company_1 = __importDefault(require("../../models/Company"));
const AutomationExecution_1 = __importDefault(require("../../models/AutomationExecution"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const AutomationLog_1 = __importDefault(require("../../models/AutomationLog"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ProcessAutomationService_1 = require("./ProcessAutomationService");
const TriggerBirthdayService_1 = __importDefault(require("./TriggerBirthdayService"));
const TriggerKanbanService_1 = require("./TriggerKanbanService");
const TriggerNoResponseService_1 = __importDefault(require("./TriggerNoResponseService"));
// Executar automações agendadas que estão pendentes
const executeScheduledAutomations = async () => {
    try {
        const now = new Date();
        // Buscar execuções agendadas que já passaram do horário
        const executions = await AutomationExecution_1.default.findAll({
            where: {
                status: "scheduled",
                scheduledAt: { [sequelize_1.Op.lte]: now }
            },
            include: [
                { model: AutomationAction_1.default, as: "automationAction" },
                { model: Contact_1.default, as: "contact" },
                { model: Ticket_1.default, as: "ticket" }
            ],
            limit: 100,
            order: [["scheduledAt", "ASC"]]
        });
        if (executions.length === 0) {
            return;
        }
        logger_1.default.info(`[Automation Job] Processando ${executions.length} execuções agendadas`);
        for (const execution of executions) {
            try {
                // Marcar como em execução
                await execution.update({
                    status: "running",
                    attempts: execution.attempts + 1,
                    lastAttemptAt: new Date()
                });
                const action = execution.automationAction;
                const contact = execution.contact;
                const ticket = execution.ticket;
                if (!action || !contact) {
                    await execution.update({
                        status: "failed",
                        error: "Ação ou contato não encontrado"
                    });
                    continue;
                }
                // Executar a ação
                const result = await (0, ProcessAutomationService_1.executeAction)(action, contact, ticket, contact.companyId);
                // Atualizar execução
                await execution.update({
                    status: result.success ? "completed" : "failed",
                    completedAt: result.success ? new Date() : null,
                    error: result.success ? null : result.message
                });
                // Atualizar log
                await AutomationLog_1.default.update({
                    status: result.success ? "completed" : "failed",
                    executedAt: new Date(),
                    result: result,
                    error: result.success ? null : result.message
                }, {
                    where: {
                        automationId: execution.automationId,
                        contactId: contact.id,
                        status: "pending"
                    }
                });
                logger_1.default.info(`[Automation Job] Execução ${execution.id} ${result.success ? "concluída" : "falhou"}: ${result.message}`);
            }
            catch (error) {
                await execution.update({
                    status: "failed",
                    error: error.message
                });
                logger_1.default.error(`[Automation Job] Erro na execução ${execution.id}: ${error.message}`);
            }
        }
    }
    catch (error) {
        logger_1.default.error(`[Automation Job] Erro geral: ${error.message}`);
    }
};
exports.executeScheduledAutomations = executeScheduledAutomations;
const getActiveCompanyIds = async () => {
    const companies = await Company_1.default.findAll({
        where: { status: true },
        attributes: ["id"]
    });
    return companies.map(company => company.id);
};
const runPerCompany = async (jobLabel, triggerType, handler) => {
    const companyIds = await getActiveCompanyIds();
    for (const companyId of companyIds) {
        try {
            const settings = await (0, ProcessAutomationService_1.getCampaignSettings)(companyId);
            if (!(0, ProcessAutomationService_1.isWithinDispatchHours)(settings, triggerType)) {
                logger_1.default.debug(`[Automation Job] Empresa ${companyId} fora da janela para ${jobLabel} (${triggerType})`);
                continue;
            }
            await handler(companyId);
        }
        catch (error) {
            logger_1.default.error(`[Automation Job] Erro na empresa ${companyId} (${jobLabel}): ${error.message}`);
        }
    }
};
// Apenas processa execuções agendadas
const runAutomationJob = async () => {
    try {
        logger_1.default.info("[Automation Job] Executando fila de execuções agendadas...");
        await (0, exports.executeScheduledAutomations)();
        logger_1.default.info("[Automation Job] Execuções agendadas concluídas");
    }
    catch (error) {
        logger_1.default.error(`[Automation Job] Erro geral: ${error.message}`);
    }
};
exports.runAutomationJob = runAutomationJob;
const runBirthdayAutomationJob = async () => {
    logger_1.default.info("[Automation Birthday Job] Iniciando processamento...");
    await runPerCompany("birthday", "birthday", TriggerBirthdayService_1.default);
    logger_1.default.info("[Automation Birthday Job] Processamento concluído");
};
exports.runBirthdayAutomationJob = runBirthdayAutomationJob;
const runKanbanAutomationJob = async () => {
    logger_1.default.info("[Automation Kanban Job] Iniciando processamento...");
    await runPerCompany("kanban_time", "kanban_time", TriggerKanbanService_1.processKanbanTimeAutomations);
    logger_1.default.info("[Automation Kanban Job] Processamento concluído");
};
exports.runKanbanAutomationJob = runKanbanAutomationJob;
const runNoResponseAutomationJob = async () => {
    logger_1.default.info("[Automation NoResponse Job] Iniciando processamento...");
    await runPerCompany("no_response", "no_response", TriggerNoResponseService_1.default);
    logger_1.default.info("[Automation NoResponse Job] Processamento concluído");
};
exports.runNoResponseAutomationJob = runNoResponseAutomationJob;
exports.default = exports.runAutomationJob;
