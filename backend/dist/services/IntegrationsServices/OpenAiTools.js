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
exports.formatMessageWithVariables = exports.isValidQueue = exports.isValidTag = exports.getToolInstructions = exports.executeOpenAiTool = exports.openAiTools = void 0;
const Tag_1 = __importDefault(require("../../models/Tag"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const User_1 = __importDefault(require("../../models/User"));
const socket_1 = require("../../libs/socket");
const logger_1 = __importDefault(require("../../utils/logger"));
const ListProfissionaisService_1 = __importDefault(require("../ProfissionalService/ListProfissionaisService"));
const AiToolGenerators_1 = require("./AiToolGenerators");
// Definição das ferramentas disponíveis para a IA (geradas a partir do catálogo)
exports.openAiTools = (0, AiToolGenerators_1.buildOpenAiToolDeclarationsFromCatalog)();
// Função para executar as ferramentas
const normalizeToolName = (name) => name ? name.trim().toLowerCase() : null;
const buildAllowedToolSet = (allowedTools) => {
    if (!allowedTools || allowedTools.length === 0) {
        return null;
    }
    const normalized = allowedTools
        .map(tool => normalizeToolName(tool))
        .filter(Boolean);
    return new Set(normalized);
};
async function executeOpenAiTool(toolName, args, ticket, contact, availableTags, allQueues, allowedTools, wbot, msg) {
    let result = { success: false };
    const allowedSet = buildAllowedToolSet(allowedTools);
    const normalizedToolName = normalizeToolName(toolName);
    try {
        if (allowedSet && (!normalizedToolName || !allowedSet.has(normalizedToolName))) {
            logger_1.default.warn(`[TOOLS] Execução bloqueada para tool "${toolName}" no ticket ${ticket.id} (companyId=${ticket.companyId})`);
            return {
                success: false,
                reason: "Ferramenta desabilitada para este prompt/empresa"
            };
        }
        switch (toolName) {
            case "execute_command":
                try {
                    let commandData = {};
                    if (args.command) {
                        const commandMatch = args.command.match(/#\{([^}]+)\}/);
                        if (commandMatch) {
                            try {
                                commandData = JSON.parse(`{${commandMatch[1]}}`);
                            }
                            catch (parseError) {
                                logger_1.default.error(`Erro ao fazer parse do comando: ${args.command}`, parseError);
                                result = { success: false, error: "Formato de comando inválido" };
                                break;
                            }
                        }
                    }
                    if (args.queueId)
                        commandData.queueId = args.queueId;
                    if (args.userId)
                        commandData.userId = args.userId;
                    if (args.tagId)
                        commandData.tagId = args.tagId;
                    if (args.closeTicket)
                        commandData.closeTicket = "1";
                    const results = [];
                    // Processar userId direto (transferência para usuário sem fila)
                    if (commandData.userId && !commandData.queueId) {
                        const userId = parseInt(commandData.userId);
                        const user = await User_1.default.findOne({
                            where: { id: userId, companyId: ticket.companyId }
                        });
                        if (user) {
                            ticket.userId = userId;
                            // Mantém status como "pending" - só muda para "open" quando usuário aceitar manualmente
                            // ticket.status = "open"; // REMOVIDO: não muda status automaticamente
                            await ticket.save();
                            results.push(`Transferido para ${user.name} (aguardando aceitação)`);
                            (0, socket_1.getIO)()
                                .of(String(ticket.companyId))
                                .emit(`company-${ticket.companyId}-ticket`, {
                                action: "update",
                                ticket
                            });
                        }
                        else {
                            results.push(`Usuário ID ${userId} não encontrado`);
                        }
                    }
                    if (commandData.queueId) {
                        const queueId = parseInt(commandData.queueId);
                        const queue = allQueues.find(q => q.id === queueId && q.companyId === ticket.companyId);
                        if (queue) {
                            // Não sobrescrever flowStopped se já foi definido por call_flow_builder
                            if (!ticket.flowStopped) {
                                ticket.queueId = queueId;
                            }
                            results.push(`Fila alterada para ${queue.name}`);
                            if (commandData.userId) {
                                const userId = parseInt(commandData.userId);
                                const user = await User_1.default.findOne({
                                    where: { id: userId, companyId: ticket.companyId }
                                });
                                if (user) {
                                    ticket.userId = userId;
                                    results.push(`Atendente alterado para ${user.name}`);
                                }
                                else {
                                    results.push(`Usuário ID ${userId} não encontrado`);
                                }
                            }
                            await ticket.save();
                            (0, socket_1.getIO)()
                                .of(String(ticket.companyId))
                                .emit(`company-${ticket.companyId}-ticket`, {
                                action: "update",
                                ticket
                            });
                        }
                        else {
                            results.push(`Fila ID ${queueId} não encontrada`);
                        }
                    }
                    if (commandData.tagId) {
                        const tagId = parseInt(commandData.tagId);
                        const tag = await Tag_1.default.findOne({
                            where: { id: tagId, companyId: ticket.companyId }
                        });
                        if (tag) {
                            await TicketTag_1.default.findOrCreate({
                                where: { ticketId: ticket.id, tagId: tag.id }
                            });
                            await ContactTag_1.default.findOrCreate({
                                where: { contactId: contact.id, tagId: tag.id }
                            });
                            results.push(`Tag "${tag.name}" adicionada`);
                            const updatedTicket = await Ticket_1.default.findByPk(ticket.id, {
                                include: [
                                    { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color"] },
                                    { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number"] },
                                    { model: User_1.default, as: "user", attributes: ["id", "name"] },
                                    { model: Queue_1.default, as: "queue", attributes: ["id", "name", "color"] }
                                ]
                            });
                            if (updatedTicket) {
                                const ticketJSON = updatedTicket.toJSON();
                                if (!ticketJSON.tags)
                                    ticketJSON.tags = [];
                                ticketJSON.tags = ticketJSON.tags.filter((tag) => tag && tag.name);
                                (0, socket_1.getIO)()
                                    .of(String(ticket.companyId))
                                    .emit(`company-${ticket.companyId}-ticket`, {
                                    action: "update",
                                    ticket: ticketJSON
                                });
                            }
                        }
                        else {
                            results.push(`Tag ID ${tagId} não encontrada`);
                        }
                    }
                    if (commandData.closeTicket === "1" || commandData.closeTicket === true) {
                        ticket.status = "closed";
                        await ticket.save();
                        results.push("Atendimento finalizado");
                        (0, socket_1.getIO)()
                            .of(String(ticket.companyId))
                            .emit(`company-${ticket.companyId}-ticket`, {
                            action: "delete",
                            ticketId: ticket.id
                        });
                    }
                    result = {
                        success: results.length > 0 && !results.some(r => r.includes("não encontrado")),
                        message: results.join(", "),
                        commandExecuted: commandData
                    };
                    logger_1.default.info(`Comando executado: ${JSON.stringify(commandData)}`);
                }
                catch (error) {
                    logger_1.default.error(`Erro ao executar comando:`, error);
                    result = {
                        success: false,
                        error: error instanceof Error ? error.message : "Erro ao executar comando"
                    };
                }
                break;
            case "execute_multiple_commands":
                try {
                    if (!args.commands || !Array.isArray(args.commands)) {
                        result = { success: false, error: "commands deve ser um array" };
                        break;
                    }
                    const allResults = [];
                    let allSuccessful = true;
                    for (const cmd of args.commands) {
                        const cmdResult = await executeOpenAiTool("execute_command", cmd, ticket, contact, availableTags, allQueues, allowedTools, wbot, msg);
                        if (cmdResult.message) {
                            allResults.push(cmdResult.message);
                        }
                        if (!cmdResult.success) {
                            allSuccessful = false;
                        }
                    }
                    result = {
                        success: allSuccessful,
                        message: allResults.join("; "),
                        commandsExecuted: args.commands.length
                    };
                    logger_1.default.info(`Múltiplos comandos executados: ${args.commands.length} comandos`);
                }
                catch (error) {
                    logger_1.default.error(`Erro ao executar múltiplos comandos:`, error);
                    result = {
                        success: false,
                        error: error instanceof Error ? error.message : "Erro ao executar múltiplos comandos"
                    };
                }
                break;
            case "format_message":
                if (args.message) {
                    try {
                        const currentUser = ticket.userId ?
                            await User_1.default.findByPk(ticket.userId) : null;
                        const currentQueue = ticket.queueId ?
                            await Queue_1.default.findByPk(ticket.queueId) : null;
                        const formattedMessage = formatMessageWithVariables(args.message, ticket, contact, currentUser || undefined, currentQueue || undefined, args.variables);
                        result = {
                            success: true,
                            formattedMessage,
                            originalMessage: args.message
                        };
                        logger_1.default.info(`Mensagem formatada com sucesso`);
                    }
                    catch (error) {
                        logger_1.default.error(`Erro ao formatar mensagem:`, error);
                        result = {
                            success: false,
                            error: error instanceof Error ? error.message : "Erro ao formatar mensagem"
                        };
                    }
                }
                else {
                    result = { success: false, reason: "Mensagem não fornecida" };
                }
                break;
            case "list_professionals": {
                try {
                    const { service_name, weekday, only_active, limit } = args;
                    const profissionais = await (0, ListProfissionaisService_1.default)({
                        companyId: ticket.companyId
                    });
                    const normalizedService = typeof service_name === "string" ? service_name.toLowerCase() : "";
                    const normalizedWeekday = typeof weekday === "string" ? weekday.toLowerCase() : "";
                    const onlyActiveFlag = Boolean(only_active);
                    const maxItems = Math.min(Math.max(Number(limit) || 15, 1), 50);
                    const filtered = profissionais
                        .filter(profissional => {
                        if (onlyActiveFlag && profissional.ativo === false)
                            return false;
                        if (normalizedService) {
                            const servicesList = Array.isArray(profissional.servicos)
                                ? profissional.servicos
                                : [];
                            const hasService = servicesList.some((service) => {
                                if (!service)
                                    return false;
                                const name = typeof service === "string" ? service : service.nome;
                                return name?.toLowerCase().includes(normalizedService);
                            });
                            if (!hasService)
                                return false;
                        }
                        if (normalizedWeekday) {
                            const agendaList = Array.isArray(profissional.agenda)
                                ? profissional.agenda
                                : [];
                            const worksOnDay = agendaList.some((item) => item?.dia?.toLowerCase() === normalizedWeekday);
                            if (!worksOnDay)
                                return false;
                        }
                        return true;
                    })
                        .slice(0, maxItems)
                        .map(profissional => ({
                        id: profissional.id,
                        nome: profissional.nome,
                        ativo: profissional.ativo,
                        comissao: profissional.comissao,
                        servicos: Array.isArray(profissional.servicos)
                            ? profissional.servicos.map((service) => ({
                                nome: typeof service === "string" ? service : service?.nome,
                                valorOriginal: service?.valorOriginal ?? null,
                                valorComDesconto: service?.valorComDesconto ?? null,
                                possuiDesconto: service?.possuiDesconto ?? false
                            }))
                            : [],
                        agenda: Array.isArray(profissional.agenda)
                            ? profissional.agenda.map((item) => ({
                                dia: item?.dia || null,
                                inicio: item?.inicio || item?.horarios || null,
                                fim: item?.fim || null,
                                almocoInicio: item?.almocoInicio || null,
                                almocoFim: item?.almocoFim || null,
                                duracaoAtendimento: (item?.duracaoAtendimento ?? item?.duracao) || null
                            }))
                            : [],
                        valorEmAberto: profissional.valorEmAberto,
                        valoresRecebidos: profissional.valoresRecebidos,
                        valoresAReceber: profissional.valoresAReceber
                    }));
                    result = {
                        success: true,
                        professionals: filtered,
                        total: filtered.length,
                        filters: {
                            service_name: normalizedService || undefined,
                            weekday: normalizedWeekday || undefined,
                            only_active: onlyActiveFlag || undefined
                        }
                    };
                }
                catch (error) {
                    logger_1.default.error("Erro ao executar list_professionals:", error);
                    result = {
                        success: false,
                        error: error instanceof Error
                            ? error.message
                            : "Erro ao listar profissionais"
                    };
                }
                break;
            }
            case "call_prompt_agent":
                if (!args.alias || !args.pergunta) {
                    result = {
                        success: false,
                        reason: "Parâmetros 'alias' e 'pergunta' são obrigatórios"
                    };
                }
                else {
                    logger_1.default.info(`call_prompt_agent solicitado com alias=${args.alias} para ticket ${ticket.id}`);
                    result = {
                        success: true,
                        message: "Solicitação registrada. Será tratada pelo orquestrador de IA."
                    };
                }
                break;
            case "call_flow_builder":
                try {
                    const flowId = parseInt(args.flowId);
                    if (!flowId || isNaN(flowId)) {
                        result = { success: false, error: "flowId inválido ou não fornecido" };
                        break;
                    }
                    // Implementação exata como o nó transferFlow
                    console.log(`TransferFlow: Transferindo para fluxo ID ${flowId}`);
                    const { FlowBuilderModel } = await Promise.resolve().then(() => __importStar(require("../../models/FlowBuilder")));
                    const targetFlow = await FlowBuilderModel.findOne({
                        where: { id: flowId, company_id: ticket.companyId }
                    });
                    if (targetFlow && targetFlow.flow) {
                        console.log(`TransferFlow: Fluxo encontrado, processando dados...`);
                        const flowData = typeof targetFlow.flow === 'string'
                            ? JSON.parse(targetFlow.flow)
                            : targetFlow.flow;
                        const newNodes = flowData.nodes || [];
                        const newConnects = flowData.connections || [];
                        console.log(`TransferFlow: Nó encontrados: ${newNodes.length}, Conexões: ${newConnects.length}`);
                        // Encontrar o nó de início do novo fluxo
                        const startNode = newNodes.find((n) => n.type === "start");
                        console.log(`TransferFlow: Nó start encontrado: ${startNode ? startNode.id : 'NÃO'}`);
                        if (startNode) {
                            // Encontrar a conexão que sai do start
                            const startConnection = newConnects.find((c) => c.source === startNode.id);
                            console.log(`TransferFlow: Conexão start encontrada: ${startConnection ? startConnection.target : 'NÃO'}`);
                            if (startConnection) {
                                // Gerar hash do fluxo
                                const crypto = require('crypto');
                                const hashWebhookId = crypto.randomBytes(6).toString('hex');
                                // Atualizar ticket com novo fluxo (exatamente como o nó)
                                await ticket.update({
                                    flowWebhook: true,
                                    lastFlowId: startConnection.target,
                                    hashFlowId: hashWebhookId,
                                    flowStopped: flowId.toString()
                                });
                                // Criar details com estrutura correta para ActionsWebhookService
                                const flowDetails = {
                                    inputs: [],
                                    keysFull: []
                                };
                                // Executar o novo fluxo recursivamente (como o nó)
                                const { ActionsWebhookService } = await Promise.resolve().then(() => __importStar(require("../WebhookService/ActionsWebhookService")));
                                await ActionsWebhookService(ticket.whatsappId, flowId, ticket.companyId, newNodes, newConnects, startConnection.target, {}, flowDetails, hashWebhookId, undefined, ticket.id, "", msg);
                                // Retornar sucesso silencioso
                                result = {
                                    success: true,
                                    silent: true,
                                    message: `TransferFlow: Cliente transferido para o flow builder ${flowId}`
                                };
                                console.log(`TransferFlow: Cliente transferido para o flow builder ${flowId}`);
                            }
                            else {
                                result = { success: false, error: "Conexão de início não encontrada no fluxo" };
                            }
                        }
                        else {
                            result = { success: false, error: "Nó de início não encontrado no fluxo" };
                        }
                    }
                    else {
                        result = { success: false, error: "Fluxo não encontrado" };
                    }
                }
                catch (error) {
                    console.error(`TransferFlow: Erro ao transferir para flow builder:`, error);
                    result = { success: false, error: "Erro ao transferir para fluxo" };
                }
                break;
            case "send_product":
            case "execute_tool":
            case "like_message":
            case "send_contact_file":
            case "send_emoji":
            case "get_company_schedule":
            case "get_contact_schedules":
            case "create_contact_schedule":
            case "update_contact_schedule":
            case "get_contact_info":
            case "update_contact_info":
            case "get_company_groups":
            case "send_group_message":
            case "allow_product_resend":
                result = {
                    success: false,
                    reason: `${toolName} precisa ser executado no contexto do OpenAiService`
                };
                logger_1.default.info(`Ferramenta ${toolName} chamada - delegada ao contexto principal`);
                break;
            default:
                result = {
                    success: false,
                    reason: `Ferramenta desconhecida: ${toolName}`
                };
        }
    }
    catch (error) {
        logger_1.default.error(`Erro ao executar ferramenta ${toolName}:`, error);
        result = {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
    return result;
}
exports.executeOpenAiTool = executeOpenAiTool;
function getToolInstructions(availableTags, queueNames) {
    return `
FERRAMENTAS DISPONÍVEIS:

1. TRANSFERIR PARA FLUXO (call_flow_builder):
   - Transfere o cliente para um fluxo automatizado específico
   - Parâmetro: flowId (ID do fluxo)
   - Exemplo: flowId: 31

2. FORMATAR MENSAGEM (format_message):
   - Personaliza mensagens com variáveis dinâmicas
   - Variáveis disponíveis:
     * {{ms}} - Saudação automática (Bom dia/tarde/noite/madrugada)
     * {{name}} / {{firstName}} - Nome completo ou primeiro nome do contato
     * {{userName}} - Nome do atendente atual
     * {{date}} - Data atual
     * {{ticket_id}} - Número do chamado
     * {{queue}} - Nome da fila/setor (configuradas: ${queueNames.join(", ") || "nenhuma"})
     * {{connection}} - Nome da conexão WhatsApp
     * {{protocol}} - Protocolo único do atendimento
     * {{hora}} - Hora atual (HH:MM:SS)
   - Exemplo: "{{ms}}  {{firstName}}! Seu protocolo é {{protocol}}"

3. EXECUTAR COMANDO (execute_command):
   - Executa comandos administrativos (transferências, tags, etc.)
   - Formato: JSON entre #{ ... }
   - Exemplos:
     * Transferir fila: #{ "queueId":"5" }
     * Transferir para atendente: #{ "queueId":"5", "userId":"12" }
     * Adicionar tag: #{ "tagId":"14" }
     * Encerrar ticket: #{ "closeTicket":"1" }
   - Tags disponíveis: ${availableTags.join(", ") || "nenhuma"}

REGRAS IMPORTANTES:
- Utilize apenas IDs confirmados nas instruções personalizadas ou no prompt.
- Se não tiver certeza do ID correto, peça confirmação antes de executar.
`;
}
exports.getToolInstructions = getToolInstructions;
function isValidTag(tagName, availableTags) {
    return availableTags.includes(tagName);
}
exports.isValidTag = isValidTag;
function isValidQueue(queueName, allQueues, companyId) {
    return allQueues.some(q => q.name === queueName && q.companyId === companyId);
}
exports.isValidQueue = isValidQueue;
function formatMessageWithVariables(message, ticket, contact, user, queue, customVariables) {
    let formattedMessage = message;
    const hour = new Date().getHours();
    let greeting = "Boa noite";
    if (hour >= 5 && hour < 12)
        greeting = "Bom dia";
    else if (hour >= 12 && hour < 18)
        greeting = "Boa tarde";
    else if (hour >= 0 && hour < 5)
        greeting = "Boa madrugada";
    formattedMessage = formattedMessage.replace(/\{\{ms\}\}/g, greeting);
    if (contact?.name) {
        formattedMessage = formattedMessage.replace(/\{\{name\}\}/g, contact.name);
        const firstName = contact.name.split(' ')[0];
        formattedMessage = formattedMessage.replace(/\{\{firstName\}\}/g, firstName);
    }
    if (user?.name) {
        formattedMessage = formattedMessage.replace(/\{\{userName\}\}/g, user.name);
    }
    const date = new Date().toLocaleDateString('pt-BR');
    formattedMessage = formattedMessage.replace(/\{\{date\}\}/g, date);
    if (ticket?.id) {
        formattedMessage = formattedMessage.replace(/\{\{ticket_id\}\}/g, ticket.id.toString());
    }
    if (queue?.name || ticket?.queue?.name) {
        const queueName = queue?.name || ticket?.queue?.name || "Sem fila";
        formattedMessage = formattedMessage.replace(/\{\{queue\}\}/g, queueName);
    }
    if (ticket?.whatsapp?.name) {
        formattedMessage = formattedMessage.replace(/\{\{connection\}\}/g, ticket.whatsapp.name);
    }
    if (ticket?.id && ticket?.createdAt) {
        const protocol = `${ticket.id}${new Date(ticket.createdAt).getTime()}`;
        formattedMessage = formattedMessage.replace(/\{\{protocol\}\}/g, protocol);
    }
    const hora = new Date().toLocaleTimeString('pt-BR');
    formattedMessage = formattedMessage.replace(/\{\{hora\}\}/g, hora);
    if (customVariables) {
        Object.keys(customVariables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            formattedMessage = formattedMessage.replace(regex, customVariables[key]);
        });
    }
    return formattedMessage;
}
exports.formatMessageWithVariables = formatMessageWithVariables;
