"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../bootstrap");
require("../database");
const CleanLidContactsRunner_1 = require("../services/ContactServices/CleanLidContactsRunner");
const logger_1 = __importDefault(require("../utils/logger"));
(0, CleanLidContactsRunner_1.runCleanLidContacts)().then(() => {
    process.exit(0);
}).catch(err => {
    logger_1.default.error("[cleanLidContacts] Erro ao processar contatos", err);
    process.exit(1);
});
