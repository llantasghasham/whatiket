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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidGeminiTool = exports.parseGeminiToolCall = exports.getGeminiToolInstructions = exports.executeGeminiTool = exports.geminiTools = void 0;
const AiToolGenerators_1 = require("./AiToolGenerators");
// Definição das ferramentas para o Gemini (geradas a partir do catálogo)
exports.geminiTools = (0, AiToolGenerators_1.buildGeminiToolDeclarationsFromCatalog)();
// NOTA: As declarações das tools agora vêm do AiToolCatalog.ts (single source of truth)
// Para adicionar/modificar tools, edite AiToolCatalog.ts
// Função para executar as ferramentas do Gemini (reutiliza a lógica do OpenAI)
async function executeGeminiTool(toolName, args, ticket, contact, availableTags, allQueues, allowedTools, wbot, msg) {
    const { executeOpenAiTool } = await Promise.resolve().then(() => __importStar(require("./OpenAiTools")));
    return executeOpenAiTool(toolName, args, ticket, contact, availableTags, allQueues, allowedTools, wbot, msg);
}
exports.executeGeminiTool = executeGeminiTool;
// Função para obter instruções sobre as ferramentas (formato Gemini)
function getGeminiToolInstructions(availableTags, queueNames) {
    return `
FERRAMENTAS DISPONÍVEIS NO GEMINI:

1. FORMATAR MENSAGEM (format_message):
   - Use para personalizar mensagens com variáveis dinâmicas.
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
   - Exemplo: "{{ms}} {{firstName}}! Seu protocolo é {{protocol}}"

2. EXECUTAR COMANDO (execute_command):
   - ÚNICA forma de transferir fila/usuário, adicionar tag ou encerrar tickets via Gemini.
   - Sempre use JSON entre #{ ... } com os IDs corretos:
     * Transferir fila: #{ "queueId":"5" }
     * Transferir para atendente: #{ "queueId":"5", "userId":"12" }
     * Transferência direta para usuário: #{ "userId":"12" }
     * Adicionar tag: #{ "tagId":"14" }
     * Encerrar ticket: #{ "closeTicket":"1" }
     * Combinado: #{ "queueId":"5", "userId":"12", "tagId":"14" }
   - Tags disponíveis: ${availableTags.join(", ") || "nenhuma"} (não invente novas).

3. ENVIAR PRODUTO (send_product):
   - Use para enviar informações de produtos ao cliente
   - Inclui imagem principal, galeria de imagens, nome, preço e descrição
   - Evite reenviar o MESMO produto várias vezes

4. OUTRAS FERRAMENTAS:
   - like_message: Envia reação/curtida
   - send_emoji: Envia emoji
   - send_contact_file: Envia arquivo do contato
   - get_company_schedule: Obtém horário de funcionamento
   - get_contact_schedules: Lista agendamentos
   - create_contact_schedule: Cria agendamento
   - update_contact_schedule: Atualiza agendamento
   - get_contact_info: Obtém dados do contato
   - update_contact_info: Atualiza dados do contato
   - get_company_groups: Lista grupos disponíveis
   - send_group_message: Envia mensagem para grupo
   - list_professionals: Lista profissionais disponíveis

REGRAS IMPORTANTES:
- Ferramentas antigas (transfer_queue, transfer_user, add_tag) foram removidas. Use execute_command com JSON.
- Utilize somente IDs confirmados nas instruções personalizadas ou no prompt.
- Se não tiver certeza do ID, peça confirmação antes de executar.
- Use format_message para textos; execute_command para QUALQUER ação administrativa.
`;
}
exports.getGeminiToolInstructions = getGeminiToolInstructions;
// Função para converter resposta do Gemini para o formato esperado
function parseGeminiToolCall(functionCall) {
    return {
        name: functionCall.name,
        args: functionCall.args || {}
    };
}
exports.parseGeminiToolCall = parseGeminiToolCall;
// Função para validar se uma ferramenta existe
function isValidGeminiTool(toolName) {
    return exports.geminiTools.some(tool => tool.name === toolName);
}
exports.isValidGeminiTool = isValidGeminiTool;
