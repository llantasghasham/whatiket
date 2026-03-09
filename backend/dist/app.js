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
exports.isBullAuth = void 0;
require("./bootstrap");
require("reflect-metadata");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const Sentry = __importStar(require("@sentry/node"));
const dotenv_1 = require("dotenv");
const body_parser_1 = __importDefault(require("body-parser"));
require("./database");
const upload_1 = __importDefault(require("./config/upload"));
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("./errors/AppError"));
const routes_1 = __importDefault(require("./routes"));
const FacebookOAuthController = __importStar(require("./controllers/FacebookOAuthController"));
const logger_1 = __importDefault(require("./utils/logger"));
const queues_1 = require("./queues");
const queue_1 = __importDefault(require("./libs/queue"));
const bull_board_1 = __importDefault(require("bull-board"));
const basic_auth_1 = __importDefault(require("basic-auth"));
// Função de middleware para autenticação básica
const isBullAuth = (req, res, next) => {
    const user = (0, basic_auth_1.default)(req);
    if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).send('Authentication required.');
    }
    next();
};
exports.isBullAuth = isBullAuth;
// Carregar variáveis de ambiente
(0, dotenv_1.config)();
// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });
const app = (0, express_1.default)();
// Trust proxy (nginx/reverse proxy) - necesario para X-Forwarded-Proto, etc.
app.set("trust proxy", 1);
// =============================================================================
// OAUTH FACEBOOK/INSTAGRAM - PRIMERO, antes de CUALQUIER middleware
// Meta redirige sin Authorization; si pasa por isAuth = ERR_SESSION_EXPIRED
// =============================================================================
app.get("/facebook-callback", (req, res, next) => {
    console.log("[OAUTH] HIT /facebook-callback - path:", req.path, "| originalUrl:", req.originalUrl);
    FacebookOAuthController.facebookCallback(req, res).catch(next);
});
app.get("/instagram-callback", (req, res, next) => {
    console.log("[OAUTH] HIT /instagram-callback - path:", req.path, "| originalUrl:", req.originalUrl);
    FacebookOAuthController.instagramCallback(req, res).catch(next);
});
app.get("/api/facebook-callback", (req, res, next) => {
    console.log("[OAUTH] HIT /api/facebook-callback - path:", req.path, "| originalUrl:", req.originalUrl);
    FacebookOAuthController.facebookCallback(req, res).catch(next);
});
app.get("/api/instagram-callback", (req, res, next) => {
    console.log("[OAUTH] HIT /api/instagram-callback - path:", req.path, "| originalUrl:", req.originalUrl);
    FacebookOAuthController.instagramCallback(req, res).catch(next);
});
// Configuração de filas
app.set("queues", {
    messageQueue: queues_1.messageQueue,
    sendScheduledMessages: queues_1.sendScheduledMessages
});
// Domínios liberados para CORS
const allowAnyOrigin = String(process.env.CORS_ALLOW_ALL).toLowerCase() === "true";
const environmentOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2,
    process.env.FRONTEND_URL_3
].filter(Boolean);
const extraOrigins = process.env.CORS_EXTRA_ORIGINS?.split(",")
    .map(origin => origin.trim())
    .filter(Boolean) || [];
const defaultDevOrigins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000"
];
const allowedOrigins = allowAnyOrigin
    ? undefined
    : Array.from(new Set([...environmentOrigins, ...extraOrigins, ...defaultDevOrigins]));
// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
    bull_board_1.default.setQueues(queue_1.default.queues.map(queue => queue && queue.bull));
    app.use('/admin/queues', exports.isBullAuth, bull_board_1.default.UI);
}
app.use((0, compression_1.default)()); // Compressão HTTP
app.use(body_parser_1.default.json({ limit: '2gb' })); // Aumentar o limite de carga para 2 GB
app.use(body_parser_1.default.urlencoded({ limit: '2gb', extended: true }));
// Configuração CORS para permitir qualquer origem
app.use((0, cors_1.default)({
    credentials: true,
    origin: true // Permite qualquer origem
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(Sentry.Handlers.requestHandler());
// Arquivos públicos com cache curto (1 hora) para evitar cache excessivo
app.use("/public", express_1.default.static(upload_1.default.directory, {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Arquivos de mídia podem ter cache mais longo
        if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 dia para imagens
        }
        else {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora para outros
        }
    }
}));
// Middleware para evitar cache nas respostas da API
app.use((req, res, next) => {
    // Não cachear respostas da API
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});
// Rotas
app.use(routes_1.default);
// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());
// Middleware de tratamento de erros
app.use(async (err, req, res, _) => {
    // Verificar se headers já foram enviados
    if (res.headersSent) {
        return;
    }
    const formatFieldName = (field) => {
        if (!field)
            return "campo obrigatório";
        return field
            .replace(/_/g, " ")
            .replace(/\b\w/g, match => match.toUpperCase());
    };
    if (err instanceof sequelize_1.ValidationError) {
        const messages = err.errors.map(error => error.message || `Campo '${error.path}' inválido.`);
        logger_1.default.warn(err);
        return res.status(400).json({ error: messages[0], errors: messages });
    }
    if (err instanceof sequelize_1.ForeignKeyConstraintError) {
        logger_1.default.warn(err);
        return res.status(400).json({
            error: "Alguma informação relacionada não foi encontrada ou é inválida. Verifique os dados enviados."
        });
    }
    if (err instanceof sequelize_1.DatabaseError) {
        const pgCode = err.parent?.code;
        const column = err.parent?.column;
        if (pgCode === "23502") {
            logger_1.default.warn(err);
            return res.status(400).json({
                error: `O campo '${formatFieldName(column)}' é obrigatório.`
            });
        }
        if (pgCode === "23505") {
            logger_1.default.warn(err);
            return res.status(400).json({
                error: "Já existe um registro com essas informações. Ajuste os dados e tente novamente."
            });
        }
    }
    if (err instanceof AppError_1.default) {
        if (err.message === "ERR_SESSION_EXPIRED") {
            console.error("[ERR_SESSION_EXPIRED] path:", req.path, "| originalUrl:", req.originalUrl, "| stack:", err.stack);
        }
        logger_1.default.warn(err);
        return res.status(err.statusCode).json({ error: err.message });
    }
    logger_1.default.error(err);
    return res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
