"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoogleCalendarEvent = exports.updateGoogleCalendarEvent = exports.createGoogleCalendarEvent = exports.buildCalendarClient = exports.getTokensFromCode = exports.getGoogleAuthUrl = exports.createOAuth2Client = void 0;
const googleapis_1 = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const createOAuth2Client = () => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    return oauth2Client;
};
exports.createOAuth2Client = createOAuth2Client;
const getGoogleAuthUrl = (scopes, state) => {
    const oauth2Client = (0, exports.createOAuth2Client)();
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        state
    });
    return url;
};
exports.getGoogleAuthUrl = getGoogleAuthUrl;
const getTokensFromCode = async (code) => {
    const oauth2Client = (0, exports.createOAuth2Client)();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
exports.getTokensFromCode = getTokensFromCode;
const buildCalendarClient = (tokens) => {
    const oauth2Client = (0, exports.createOAuth2Client)();
    oauth2Client.setCredentials(tokens);
    const calendar = googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
    return calendar;
};
exports.buildCalendarClient = buildCalendarClient;
const createGoogleCalendarEvent = async (accessToken, refreshToken = null, eventData, calendarId = "primary") => {
    try {
        const oauth2Client = (0, exports.createOAuth2Client)();
        // Configurar credenciais com access e refresh tokens
        const credentials = { access_token: accessToken };
        if (refreshToken) {
            credentials.refresh_token = refreshToken;
        }
        oauth2Client.setCredentials(credentials);
        // Configurar refresh automático se tiver refresh token
        if (refreshToken) {
            oauth2Client.on('tokens', (tokens) => {
                if (tokens.refresh_token) {
                    // Aqui você poderia salvar o novo refresh token no banco
                    console.log("DEBUG - Novos tokens recebidos:", tokens);
                }
            });
        }
        const calendar = googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
        const event = await calendar.events.insert({
            calendarId,
            requestBody: eventData
        });
        return event.data;
    }
    catch (error) {
        console.error("Erro ao criar evento no Google Calendar:", error);
        // Se for erro de token expirado, tentar refresh
        if (error.code === 401 && refreshToken) {
            try {
                console.log("DEBUG - Tentando refresh do token...");
                const oauth2Client = (0, exports.createOAuth2Client)();
                oauth2Client.setCredentials({ refresh_token: refreshToken });
                const { credentials } = await oauth2Client.refreshAccessToken();
                // Tentar novamente com o novo token
                return await (0, exports.createGoogleCalendarEvent)(credentials.access_token, refreshToken, eventData, calendarId);
            }
            catch (refreshError) {
                console.error("ERROR - Falha no refresh do token:", refreshError);
                throw refreshError;
            }
        }
        throw error;
    }
};
exports.createGoogleCalendarEvent = createGoogleCalendarEvent;
const updateGoogleCalendarEvent = async (accessToken, refreshToken = null, eventId, eventData, calendarId = "primary") => {
    try {
        const oauth2Client = (0, exports.createOAuth2Client)();
        // Configurar credenciais com access e refresh tokens
        const credentials = { access_token: accessToken };
        if (refreshToken) {
            credentials.refresh_token = refreshToken;
        }
        oauth2Client.setCredentials(credentials);
        const calendar = googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
        const event = await calendar.events.update({
            calendarId,
            eventId,
            requestBody: eventData
        });
        return event.data;
    }
    catch (error) {
        console.error("Erro ao atualizar evento no Google Calendar:", error);
        // Se for erro de token expirado, tentar refresh
        if (error.code === 401 && refreshToken) {
            try {
                console.log("DEBUG - Tentando refresh do token para update...");
                const oauth2Client = (0, exports.createOAuth2Client)();
                oauth2Client.setCredentials({ refresh_token: refreshToken });
                const { credentials } = await oauth2Client.refreshAccessToken();
                // Tentar novamente com o novo token
                return await (0, exports.updateGoogleCalendarEvent)(credentials.access_token, refreshToken, eventId, eventData, calendarId);
            }
            catch (refreshError) {
                console.error("ERROR - Falha no refresh do token para update:", refreshError);
                throw refreshError;
            }
        }
        throw error;
    }
};
exports.updateGoogleCalendarEvent = updateGoogleCalendarEvent;
const deleteGoogleCalendarEvent = async (accessToken, refreshToken = null, eventId, calendarId = "primary") => {
    try {
        const oauth2Client = (0, exports.createOAuth2Client)();
        // Configurar credenciais com access e refresh tokens
        const credentials = { access_token: accessToken };
        if (refreshToken) {
            credentials.refresh_token = refreshToken;
        }
        oauth2Client.setCredentials(credentials);
        const calendar = googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.delete({
            calendarId,
            eventId
        });
        return true;
    }
    catch (error) {
        console.error("Erro ao excluir evento no Google Calendar:", error);
        // Se for erro de token expirado, tentar refresh
        if (error.code === 401 && refreshToken) {
            try {
                console.log("DEBUG - Tentando refresh do token para delete...");
                const oauth2Client = (0, exports.createOAuth2Client)();
                oauth2Client.setCredentials({ refresh_token: refreshToken });
                const { credentials } = await oauth2Client.refreshAccessToken();
                // Tentar novamente com o novo token
                return await (0, exports.deleteGoogleCalendarEvent)(credentials.access_token, refreshToken, eventId, calendarId);
            }
            catch (refreshError) {
                console.error("ERROR - Falha no refresh do token para delete:", refreshError);
                throw refreshError;
            }
        }
        throw error;
    }
};
exports.deleteGoogleCalendarEvent = deleteGoogleCalendarEvent;
