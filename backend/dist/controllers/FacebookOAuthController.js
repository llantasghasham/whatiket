"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instagramCallback = exports.facebookCallback = void 0;
const socket_1 = require("../libs/socket");
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const graphAPI_1 = require("../services/FacebookServices/graphAPI");
const ShowCompanyService_1 = __importDefault(require("../services/CompanyService/ShowCompanyService"));
const ShowPlanService_1 = __importDefault(require("../services/PlanService/ShowPlanService"));
const facebookCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log("Facebook OAuth Callback - code:", code ? "present" : "missing");
        console.log("Facebook OAuth Callback - state:", state);
        if (!code || typeof code !== "string") {
            res.status(400).json({ error: "Missing authorization code" });
            return;
        }
        if (!state || typeof state !== "string") {
            res.status(400).json({ error: "Missing state parameter" });
            return;
        }
        const companyId = state;
        // Verificar se empresa existe e tem plano ativo
        const company = await (0, ShowCompanyService_1.default)(companyId);
        const plan = await (0, ShowPlanService_1.default)(company.planId);
        if (!plan.useFacebook) {
            res.status(400).json({ error: "Empresa não possui permissão para Facebook" });
            return;
        }
        // Trocar code por access token (redirect_uri deve ser exatamente o mesmo usado no frontend: backend)
        const facebookAppId = process.env.FACEBOOK_APP_ID;
        const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
        const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000";
        const redirectUri = `${backendUrl.replace(/\/$/, "")}/facebook-callback`;
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error("Erro ao obter access token:", tokenData);
            res.status(400).json({ error: "Erro ao obter token de acesso" });
            return;
        }
        const userToken = tokenData.access_token;
        // Obter páginas do usuário (Graph API retorna { data: [ ... ] })
        const pagesResponse = await (0, graphAPI_1.getPageProfile)(tokenData.user_id || "me", userToken);
        const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];
        if (pages.length === 0) {
            res.status(400).json({ error: "Nenhuma página encontrada" });
            return;
        }
        // Criar conexões para cada página
        const io = (0, socket_1.getIO)();
        const createdConnections = [];
        for await (const page of pages) {
            const { name, access_token, id, instagram_business_account } = page;
            const pageToken = await (0, graphAPI_1.getAccessTokenFromPage)(access_token);
            // Criar conexão Facebook
            const facebookConnection = await Whatsapp_1.default.create({
                companyId,
                name: `FB ${name}`,
                facebookUserId: tokenData.user_id || "me",
                facebookPageUserId: id,
                facebookUserToken: pageToken,
                tokenMeta: userToken,
                isDefault: false,
                channel: "facebook",
                status: "CONNECTED",
                greetingMessage: "",
                farewellMessage: "",
                queueIds: [],
                isMultidevice: false
            });
            // Inscrever webhook
            await (0, graphAPI_1.subscribeApp)(id, pageToken);
            createdConnections.push(facebookConnection);
            // Se tiver Instagram, criar conexão também
            if (instagram_business_account) {
                const { id: instagramId, username, name: instagramName } = instagram_business_account;
                const instagramConnection = await Whatsapp_1.default.create({
                    companyId,
                    name: `Insta ${username || instagramName}`,
                    facebookUserId: tokenData.user_id || "me",
                    facebookPageUserId: instagramId,
                    facebookUserToken: pageToken,
                    tokenMeta: userToken,
                    isDefault: false,
                    channel: "instagram",
                    status: "CONNECTED",
                    greetingMessage: "",
                    farewellMessage: "",
                    queueIds: [],
                    isMultidevice: false
                });
                createdConnections.push(instagramConnection);
            }
        }
        // Emitir evento para atualizar frontend
        io.to(`company-${companyId}`).emit("whatsapp", {
            action: "update",
            whatsapp: createdConnections
        });
        // Redirecionar para frontend com sucesso
        res.redirect(`${process.env.FRONTEND_URL}/canais?success=facebook-connected`);
    }
    catch (error) {
        console.error("Erro no Facebook OAuth callback:", error);
        res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
    }
};
exports.facebookCallback = facebookCallback;
const instagramCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log("Instagram OAuth Callback - code:", code ? "present" : "missing");
        console.log("Instagram OAuth Callback - state:", state);
        if (!code || typeof code !== "string") {
            res.status(400).json({ error: "Missing authorization code" });
            return;
        }
        if (!state || typeof state !== "string") {
            res.status(400).json({ error: "Missing state parameter" });
            return;
        }
        const companyId = state;
        // Verificar se empresa existe e tem plano ativo
        const company = await (0, ShowCompanyService_1.default)(companyId);
        const plan = await (0, ShowPlanService_1.default)(company.planId);
        if (!plan.useInstagram) {
            res.status(400).json({ error: "Empresa não possui permissão para Instagram" });
            return;
        }
        // Trocar code por access token (redirect_uri deve ser o backend, igual ao usado no frontend)
        const facebookAppId = process.env.FACEBOOK_APP_ID;
        const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
        const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000";
        const redirectUri = `${backendUrl.replace(/\/$/, "")}/instagram-callback`;
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error("Erro ao obter access token:", tokenData);
            res.status(400).json({ error: "Erro ao obter token de acesso" });
            return;
        }
        const userToken = tokenData.access_token;
        // Obter páginas (Graph API retorna { data: [ ... ] })
        const pagesResponse = await (0, graphAPI_1.getPageProfile)(tokenData.user_id || "me", userToken);
        const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];
        if (pages.length === 0) {
            res.status(400).json({ error: "Nenhuma página com Instagram encontrada" });
            return;
        }
        // Criar conexões apenas para páginas com Instagram
        const io = (0, socket_1.getIO)();
        const createdConnections = [];
        for await (const page of pages) {
            const { name, access_token, id, instagram_business_account } = page;
            // Apenas criar se tiver Instagram Business
            if (instagram_business_account) {
                const { id: instagramId, username, name: instagramName } = instagram_business_account;
                const pageToken = await (0, graphAPI_1.getAccessTokenFromPage)(access_token);
                const instagramConnection = await Whatsapp_1.default.create({
                    companyId,
                    name: `Insta ${username || instagramName}`,
                    facebookUserId: tokenData.user_id || "me",
                    facebookPageUserId: instagramId,
                    facebookUserToken: pageToken,
                    tokenMeta: userToken,
                    isDefault: false,
                    channel: "instagram",
                    status: "CONNECTED",
                    greetingMessage: "",
                    farewellMessage: "",
                    queueIds: [],
                    isMultidevice: false
                });
                createdConnections.push(instagramConnection);
                // Inscrever webhook
                await (0, graphAPI_1.subscribeApp)(id, pageToken);
            }
        }
        if (createdConnections.length === 0) {
            res.status(400).json({ error: "Nenhuma conta Instagram Business encontrada" });
            return;
        }
        // Emitir evento para atualizar frontend
        io.to(`company-${companyId}`).emit("whatsapp", {
            action: "update",
            whatsapp: createdConnections
        });
        // Redirecionar para frontend com sucesso
        res.redirect(`${process.env.FRONTEND_URL}/canais?success=instagram-connected`);
    }
    catch (error) {
        console.error("Erro no Instagram OAuth callback:", error);
        res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
    }
};
exports.instagramCallback = instagramCallback;
