"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitQuestionTimeoutAction = exports.waitQuestionSendQuestion = void 0;
const WaitQuestionService_1 = __importDefault(require("../services/FlowBuilderService/WaitQuestionService"));
// Worker para enviar perguntas do waitQuestion
const waitQuestionSendQuestion = {
    key: "WaitQuestion/SendQuestion",
    async handle({ data }) {
        try {
            console.log(`[WaitQuestionWorker] Enviando pergunta para ticket ${data.ticketId}`);
            await WaitQuestionService_1.default.sendQuestion(data);
            console.log(`[WaitQuestionWorker] Pergunta enviada com sucesso para ticket ${data.ticketId}`);
        }
        catch (error) {
            console.error(`[WaitQuestionWorker] Erro ao enviar pergunta:`, error);
            throw error;
        }
    }
};
exports.waitQuestionSendQuestion = waitQuestionSendQuestion;
// Worker para executar ações de timeout
const waitQuestionTimeoutAction = {
    key: "WaitQuestion/TimeoutAction",
    async handle({ data }) {
        try {
            console.log(`[WaitQuestionWorker] Executando timeout para ticket ${data.ticketId}`);
            await WaitQuestionService_1.default.executeTimeoutAction(data);
            console.log(`[WaitQuestionWorker] Timeout executado com sucesso para ticket ${data.ticketId}`);
        }
        catch (error) {
            console.error(`[WaitQuestionWorker] Erro ao executar timeout:`, error);
            throw error;
        }
    }
};
exports.waitQuestionTimeoutAction = waitQuestionTimeoutAction;
exports.default = waitQuestionSendQuestion;
