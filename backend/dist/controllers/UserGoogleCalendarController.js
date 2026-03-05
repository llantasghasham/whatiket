"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkCalendarFromSchedule = exports.linkCalendarToSchedule = exports.createFromCompanyIntegration = exports.disconnectUserIntegration = exports.getUserIntegration = exports.userOauthCallback = exports.getUserAuthUrl = void 0;
const googleCalendarClient_1 = require("../helpers/googleCalendarClient");
const CreateUserGoogleCalendarIntegrationService_1 = __importDefault(require("../services/UserGoogleCalendarServices/CreateUserGoogleCalendarIntegrationService"));
const GetUserGoogleCalendarIntegrationService_1 = __importDefault(require("../services/UserGoogleCalendarServices/GetUserGoogleCalendarIntegrationService"));
const DeleteUserGoogleCalendarIntegrationService_1 = __importDefault(require("../services/UserGoogleCalendarServices/DeleteUserGoogleCalendarIntegrationService"));
const LinkGoogleCalendarToScheduleService_1 = require("../services/UserGoogleCalendarServices/LinkGoogleCalendarToScheduleService");
const GoogleCalendarIntegration_1 = __importDefault(require("../models/GoogleCalendarIntegration"));
const SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "openid",
    "email",
    "profile"
];
const getUserAuthUrl = async (req, res) => {
    const { id: userId } = req.user;
    const { companyId } = req.user;
    if (!companyId) {
        return res.status(400).json({ error: "User does not have companyId" });
    }
    const state = `${userId}-${companyId}`;
    console.log("DEBUG Generated state:", state);
    const url = (0, googleCalendarClient_1.getGoogleAuthUrl)(SCOPES, state);
    return res.status(200).json({ url });
};
exports.getUserAuthUrl = getUserAuthUrl;
const userOauthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log("DEBUG OAuth Callback - code:", code ? "present" : "missing");
        console.log("DEBUG OAuth Callback - state:", state);
        console.log("DEBUG OAuth Callback - full query:", req.query);
        if (!code || typeof code !== "string") {
            res.status(400).json({ error: "Missing code" });
            return;
        }
        const [userId, companyId] = state.split("-");
        console.log("DEBUG OAuth Callback - parsed userId:", userId);
        console.log("DEBUG OAuth Callback - parsed companyId:", companyId);
        if (!userId || !companyId) {
            res.status(400).json({ error: "Missing userId or companyId in state" });
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
        await (0, CreateUserGoogleCalendarIntegrationService_1.default)({
            userId: Number(userId),
            companyId: Number(companyId),
            googleUserId,
            email,
            accessToken,
            refreshToken,
            expiryDate,
            calendarId: "primary"
        });
        const redirectUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/user-schedules?google-calendar-success=true`
            : "/";
        res.redirect(redirectUrl);
    }
    catch (err) {
        console.error("Erro no userOauthCallback do Google Calendar", err);
        res.status(500).json({ error: "Erro ao integrar com Google Calendar" });
    }
};
exports.userOauthCallback = userOauthCallback;
const getUserIntegration = async (req, res) => {
    try {
        const { id: userId } = req.user;
        console.log("DEBUG getUserIntegration - userId:", userId);
        const integration = await (0, GetUserGoogleCalendarIntegrationService_1.default)(Number(userId));
        console.log("DEBUG getUserIntegration - integration:", integration);
        if (!integration) {
            return res.status(200).json(null);
        }
        return res.status(200).json({
            id: integration.id,
            email: integration.email,
            calendarId: integration.calendarId,
            active: integration.active,
            lastSyncAt: integration.lastSyncAt
        });
    }
    catch (err) {
        console.error("DEBUG getUserIntegration - Erro:", err);
        return res.status(500).json({ error: "Erro ao buscar integração do usuário" });
    }
};
exports.getUserIntegration = getUserIntegration;
const disconnectUserIntegration = async (req, res) => {
    const { id: userId } = req.user;
    const success = await (0, DeleteUserGoogleCalendarIntegrationService_1.default)(Number(userId));
    return res.status(200).json({ success });
};
exports.disconnectUserIntegration = disconnectUserIntegration;
const createFromCompanyIntegration = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { companyId } = req.user;
        console.log("DEBUG createFromCompanyIntegration - userId:", userId);
        console.log("DEBUG createFromCompanyIntegration - companyId:", companyId);
        // Buscar integração empresarial
        const companyIntegration = await GoogleCalendarIntegration_1.default.findOne({
            where: { companyId }
        });
        console.log("DEBUG createFromCompanyIntegration - companyIntegration:", companyIntegration);
        if (!companyIntegration) {
            console.log("DEBUG createFromCompanyIntegration - Integração empresarial não encontrada");
            return res.status(400).json({ error: "Integração empresarial não encontrada" });
        }
        // Criar integração para o usuário baseada na empresarial
        console.log("DEBUG createFromCompanyIntegration - Criando integração para usuário...");
        const userIntegration = await (0, CreateUserGoogleCalendarIntegrationService_1.default)({
            userId: Number(userId),
            companyId: Number(companyId),
            googleUserId: companyIntegration.googleUserId,
            email: companyIntegration.email,
            accessToken: companyIntegration.accessToken,
            refreshToken: companyIntegration.refreshToken,
            expiryDate: companyIntegration.expiryDate,
            calendarId: companyIntegration.calendarId
        });
        console.log("DEBUG createFromCompanyIntegration - Integração criada:", userIntegration);
        return res.status(200).json({
            success: true,
            integration: {
                id: userIntegration.id,
                email: userIntegration.email,
                calendarId: userIntegration.calendarId
            }
        });
    }
    catch (err) {
        console.error("DEBUG createFromCompanyIntegration - Erro:", err);
        return res.status(400).json({
            error: err.message || "Erro ao criar integração do usuário"
        });
    }
};
exports.createFromCompanyIntegration = createFromCompanyIntegration;
const linkCalendarToSchedule = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { scheduleId } = req.body;
        const schedule = await (0, LinkGoogleCalendarToScheduleService_1.LinkGoogleCalendarToScheduleService)(Number(userId), Number(scheduleId));
        return res.status(200).json({
            success: true,
            schedule: {
                id: schedule.id,
                name: schedule.name,
                googleCalendarIntegrationId: schedule.userGoogleCalendarIntegrationId
            }
        });
    }
    catch (err) {
        console.error("Erro ao vincular Google Calendar à agenda:", err);
        return res.status(400).json({
            error: err.message || "Erro ao vincular Google Calendar à agenda"
        });
    }
};
exports.linkCalendarToSchedule = linkCalendarToSchedule;
const unlinkCalendarFromSchedule = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { scheduleId } = req.body;
        const schedule = await (0, LinkGoogleCalendarToScheduleService_1.UnlinkGoogleCalendarFromScheduleService)(Number(userId), Number(scheduleId));
        return res.status(200).json({
            success: true,
            schedule: {
                id: schedule.id,
                name: schedule.name,
                googleCalendarIntegrationId: schedule.userGoogleCalendarIntegrationId
            }
        });
    }
    catch (err) {
        console.error("Erro ao desvincular Google Calendar da agenda:", err);
        return res.status(400).json({
            error: err.message || "Erro ao desvincular Google Calendar da agenda"
        });
    }
};
exports.unlinkCalendarFromSchedule = unlinkCalendarFromSchedule;
