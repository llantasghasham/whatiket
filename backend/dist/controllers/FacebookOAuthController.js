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
        console.log("HIT FACEBOOK CONTROLLER CALLBACK | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
        const { code, state } = req.query;
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
        if (plan && plan.useFacebook === false) {
            console.warn("[Facebook OAuth] Plan useFacebook=false, allowing anyway");
        }
        const facebookAppId = process.env.FACEBOOK_APP_ID;
        const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
        const backendUrl = (process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000").replace(/\/$/, "");
        const redirectUri = `${backendUrl}/facebook-callback`;
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error("[Facebook OAuth] Erro ao obter access token:", JSON.stringify(tokenData));
            res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
            return;
        }
        const userToken = tokenData.access_token;
        const pagesResponse = await (0, graphAPI_1.getPageProfile)(tokenData.user_id || "me", userToken);
        const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];
        if (pages.length === 0) {
            console.error("[Facebook OAuth] Nenhuma página encontrada");
            res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
            return;
        }
        const io = (0, socket_1.getIO)();
        const createdConnections = [];
        for (const page of pages) {
            const { name, access_token, id, instagram_business_account } = page;
            const pageToken = await (0, graphAPI_1.getAccessTokenFromPage)(access_token);
            let facebookConnection;
            const existFb = await Whatsapp_1.default.findOne({ where: { facebookPageUserId: id, channel: "facebook", companyId } });
            if (existFb) {
                await existFb.update({
                    facebookUserId: tokenData.user_id || "me",
                    facebookUserToken: pageToken,
                    tokenMeta: userToken,
                    status: "CONNECTED",
                });
                facebookConnection = existFb;
            }
            else {
                facebookConnection = await Whatsapp_1.default.create({
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
            }
            await (0, graphAPI_1.subscribeApp)(id, pageToken);
            createdConnections.push(facebookConnection);
            if (instagram_business_account) {
                const { id: instagramId, username, name: instagramName } = instagram_business_account;
                let instagramConnection;
                const existIg = await Whatsapp_1.default.findOne({ where: { facebookPageUserId: instagramId, channel: "instagram", companyId } });
                if (existIg) {
                    await existIg.update({
                        facebookUserToken: pageToken,
                        tokenMeta: userToken,
                        status: "CONNECTED",
                    });
                    instagramConnection = existIg;
                }
                else {
                    instagramConnection = await Whatsapp_1.default.create({
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
                }
                createdConnections.push(instagramConnection);
            }
        }
        createdConnections.forEach((conn) => {
            io.of(String(companyId)).emit(`company-${companyId}-whatsapp`, {
                action: "update",
                whatsapp: conn
            });
        });
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
        if (plan && plan.useInstagram === false) {
            console.warn("[Instagram OAuth] Plan useInstagram=false, allowing anyway");
        }
        const facebookAppId = process.env.FACEBOOK_APP_ID;
        const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
        const backendUrl = (process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000").replace(/\/$/, "");
        const redirectUri = `${backendUrl}/instagram-callback`;
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            console.error("[Instagram OAuth] Erro ao obter access token:", JSON.stringify(tokenData));
            res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
            return;
        }
        const userToken = tokenData.access_token;
        const pagesResponse = await (0, graphAPI_1.getPageProfile)(tokenData.user_id || "me", userToken);
        const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];
        if (pages.length === 0) {
            console.error("[Instagram OAuth] Nenhuma página com Instagram encontrada");
            res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
            return;
        }
        const io = (0, socket_1.getIO)();
        const createdConnections = [];
        for (const page of pages) {
            const { name, access_token, id, instagram_business_account } = page;
            // Apenas criar se tiver Instagram Business
            if (instagram_business_account) {
                const { id: instagramId, username, name: instagramName } = instagram_business_account;
                const pageToken = await (0, graphAPI_1.getAccessTokenFromPage)(access_token);
                let instagramConnection;
                const existIg = await Whatsapp_1.default.findOne({ where: { facebookPageUserId: instagramId, channel: "instagram", companyId } });
                if (existIg) {
                    await existIg.update({
                        facebookUserToken: pageToken,
                        tokenMeta: userToken,
                        status: "CONNECTED",
                    });
                    instagramConnection = existIg;
                }
                else {
                    instagramConnection = await Whatsapp_1.default.create({
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
                }
                createdConnections.push(instagramConnection);
                await (0, graphAPI_1.subscribeApp)(id, pageToken);
            }
        }
        if (createdConnections.length === 0) {
            console.error("[Instagram OAuth] Nenhuma conta Instagram Business encontrada");
            res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
            return;
        }
        createdConnections.forEach((conn) => {
            io.of(String(companyId)).emit(`company-${companyId}-whatsapp`, {
                action: "update",
                whatsapp: conn
            });
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
