"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectIntegration = exports.getIntegrations = exports.getIntegration = exports.oauthCallback = exports.getAuthUrl = void 0;
const googleCalendarClient_1 = require("../helpers/googleCalendarClient");
const UpsertIntegrationService_1 = __importDefault(require("../services/GoogleCalendar/UpsertIntegrationService"));
const GetIntegrationService_1 = __importDefault(require("../services/GoogleCalendar/GetIntegrationService"));
const GoogleCalendarIntegration_1 = __importDefault(require("../models/GoogleCalendarIntegration"));
const SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "openid",
    "email",
    "profile"
];
const getAuthUrl = async (req, res) => {
    const { companyId, id: userId } = req.user;
    const state = `${userId}-${companyId}`;
    const url = (0, googleCalendarClient_1.getGoogleAuthUrl)(SCOPES, state);
    return res.status(200).json({ url });
};
exports.getAuthUrl = getAuthUrl;
const oauthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log("DEBUG Google OAuth Callback - code:", code ? "present" : "missing");
        console.log("DEBUG Google OAuth Callback - state:", state);
        if (!code || typeof code !== "string") {
            res.status(400).json({ error: "Missing code" });
            return;
        }
        // Para compatibilidade com integrações antigas, verificar se state é apenas companyId
        let userIdFromState, companyIdFromState;
        if (state && !state.includes("-")) {
            // Formato antigo: apenas companyId
            companyIdFromState = state;
            userIdFromState = null;
            console.log("DEBUG Google OAuth Callback - Usando formato antigo (apenas companyId)");
        }
        else {
            // Formato novo: userId-companyId
            [userIdFromState, companyIdFromState] = state ? state.split("-") : [null, null];
            console.log("DEBUG Google OAuth Callback - Usando formato novo (userId-companyId)");
        }
        if (!companyIdFromState) {
            res.status(400).json({ error: "Missing companyId in state" });
            return;
        }
        const tokens = await (0, googleCalendarClient_1.getTokensFromCode)(code);
        let googleUserId = "";
        let email = "";
        if (tokens.id_token) {
            try {
                const [, payload] = tokens.id_token.split(".");
                const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
                googleUserId = decoded.sub || "";
                email = decoded.email || "";
            }
            catch (e) {
                console.error("Erro ao decodificar id_token do Google", e);
            }
        }
        const accessToken = tokens.access_token;
        const refreshToken = (tokens.refresh_token || "");
        const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
        // Se não tiver userId, usar null para compatibilidade
        const integrationData = {
            companyId: Number(companyIdFromState),
            googleUserId,
            email,
            accessToken,
            refreshToken,
            expiryDate,
            calendarId: "primary"
        };
        if (userIdFromState) {
            integrationData.userId = Number(userIdFromState);
        }
        console.log("DEBUG Google OAuth Callback - integrationData:", integrationData);
        await (0, UpsertIntegrationService_1.default)(integrationData);
        const redirectUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/integrations/google-calendar/success`
            : "/";
        res.redirect(redirectUrl);
    }
    catch (err) {
        console.error("Erro no oauthCallback do Google Calendar", err);
        res.status(500).json({ error: "Erro ao integrar com Google Calendar" });
    }
};
exports.oauthCallback = oauthCallback;
const getIntegration = async (req, res) => {
    const { companyId } = req.user;
    const integration = await (0, GetIntegrationService_1.default)(companyId);
    if (!integration) {
        return res.status(200).json(null);
    }
    return res.status(200).json({
        email: integration.email,
        calendarId: integration.calendarId
    });
};
exports.getIntegration = getIntegration;
const getIntegrations = async (req, res) => {
    const { companyId } = req.user;
    const integrations = await GoogleCalendarIntegration_1.default.findAll({
        where: { companyId },
        include: [
            {
                model: (require("../models/User")).default,
                attributes: ["id", "name", "email"]
            }
        ]
    });
    return res.status(200).json(integrations);
};
exports.getIntegrations = getIntegrations;
const disconnectIntegration = async (req, res) => {
    const { companyId } = req.user;
    await GoogleCalendarIntegration_1.default.destroy({ where: { companyId } });
    return res.status(200).json({ success: true });
};
exports.disconnectIntegration = disconnectIntegration;
