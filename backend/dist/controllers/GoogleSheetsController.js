"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOperation = exports.testConnection = exports.getAuthStatus = exports.authCallback = exports.authenticate = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const googleapis_1 = require("googleapis");
const logger_1 = __importDefault(require("../utils/logger"));
const GoogleSheetsToken_1 = __importDefault(require("../models/GoogleSheetsToken"));
const createOAuthClient = () => {
    const redirectUri = process.env.GOOGLE_SHEETS_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
    return new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
};
const getTokenRecord = async (companyId) => GoogleSheetsToken_1.default.findOne({ where: { companyId } });
const setCredentialsFromRecord = (client, record) => {
    client.setCredentials({
        access_token: record.accessToken,
        refresh_token: record.refreshToken || undefined,
        expiry_date: record.expiryDate ? new Date(record.expiryDate).getTime() : undefined
    });
};
const refreshTokensIfNeeded = async (client, record) => {
    const expiry = record.expiryDate ? new Date(record.expiryDate).getTime() : null;
    if (!expiry || Date.now() < expiry - 60 * 1000) {
        return record;
    }
    const { credentials } = await client.refreshAccessToken();
    await record.update({
        accessToken: credentials.access_token || record.accessToken,
        refreshToken: credentials.refresh_token || record.refreshToken,
        expiryDate: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : record.expiryDate,
        rawTokens: credentials
    });
    return record;
};
const saveCompanyTokens = async (companyId, tokens, extra) => {
    const existing = await getTokenRecord(companyId);
    const payload = {
        companyId,
        googleUserId: extra?.googleUserId || existing?.googleUserId || "",
        email: extra?.email || existing?.email || "",
        accessToken: tokens.access_token || existing?.accessToken,
        refreshToken: tokens.refresh_token || existing?.refreshToken,
        expiryDate: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : existing?.expiryDate,
        rawTokens: tokens
    };
    if (!payload.accessToken) {
        throw new AppError_1.default("Token de acesso inválido.");
    }
    if (existing) {
        await existing.update(payload);
        return existing;
    }
    return GoogleSheetsToken_1.default.create(payload);
};
const ensureAuthenticatedClient = async (companyId) => {
    const record = await getTokenRecord(companyId);
    if (!record || !record.accessToken) {
        throw new AppError_1.default("Não autenticado. Faça a autenticação primeiro.");
    }
    const client = createOAuthClient();
    setCredentialsFromRecord(client, record);
    await refreshTokensIfNeeded(client, record);
    return { client, record };
};
const authenticate = async (req, res) => {
    try {
        const { companyId } = req.body;
        if (!companyId) {
            throw new AppError_1.default("CompanyId não fornecido");
        }
        // Gerar URL de autenticação
        const oauth2Client = createOAuthClient();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets'],
            prompt: 'consent',
            state: String(companyId), // Passar companyId como state para callback
        });
        logger_1.default.info(`Google Sheets: URL de autenticação gerada para companyId: ${companyId}`);
        return res.json({
            authUrl,
            message: "Use esta URL para autenticar com Google"
        });
    }
    catch (error) {
        logger_1.default.error("Google Sheets: Erro ao gerar URL de autenticação:", error);
        throw new AppError_1.default("Erro ao gerar URL de autenticação");
    }
};
exports.authenticate = authenticate;
const authCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            throw new AppError_1.default("Código de autorização não fornecido");
        }
        const companyId = state ? Number(state) : null;
        if (!companyId) {
            throw new AppError_1.default("CompanyId inválido ou ausente no state");
        }
        const oauth2Client = createOAuthClient();
        // Trocar código por tokens
        const tokenResponse = await oauth2Client.getToken(code);
        const { tokens } = tokenResponse;
        await saveCompanyTokens(companyId, tokens);
        oauth2Client.setCredentials(tokens);
        logger_1.default.info(`Google Sheets: Autenticação concluída com sucesso para companyId ${companyId}`);
        // Redirecionar para página de sucesso
        return res.send(`
      <html>
        <head>
          <title>Autenticação Concluída</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4CAF50; font-size: 24px; }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="success">✅ Autenticação com Google Sheets concluída!</div>
          <div class="info">Você pode fechar esta janela e voltar para o sistema.</div>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
    }
    catch (error) {
        logger_1.default.error("Google Sheets: Erro no callback de autenticação:", error);
        throw new AppError_1.default("Erro na autenticação com Google");
    }
};
exports.authCallback = authCallback;
const getAuthStatus = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) {
            throw new AppError_1.default("CompanyId não fornecido");
        }
        const record = await getTokenRecord(Number(companyId));
        const isAuthenticated = !!record?.accessToken;
        logger_1.default.info(`Google Sheets: Verificação de status para companyId: ${companyId}`);
        return res.json({
            authenticated: isAuthenticated,
            message: isAuthenticated ? "Autenticado" : "Não autenticado"
        });
    }
    catch (error) {
        logger_1.default.error("Google Sheets: Erro ao verificar status da autenticação:", error);
        throw new AppError_1.default("Erro ao verificar status da autenticação");
    }
};
exports.getAuthStatus = getAuthStatus;
const testConnection = async (req, res) => {
    try {
        const { companyId, spreadsheetId, sheetName } = req.body;
        if (!companyId) {
            throw new AppError_1.default("CompanyId não fornecido");
        }
        if (!spreadsheetId) {
            throw new AppError_1.default("ID da planilha não fornecido");
        }
        logger_1.default.info(`Google Sheets: Testando conexão para companyId: ${companyId}, planilha: ${spreadsheetId}`);
        const { client, record } = await ensureAuthenticatedClient(Number(companyId));
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
        // Tentar ler metadados da planilha
        const spreadsheetResponse = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        // Tentar ler a aba especificada
        const sheetResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName || 'Sheet1'}!A1:Z1`,
        });
        const spreadsheetName = spreadsheetResponse.data.properties?.title || "Planilha";
        const sheetExists = sheetResponse.data.values !== undefined;
        logger_1.default.info(`Google Sheets: Teste concluído - Planilha: ${spreadsheetName}, Aba: ${sheetName}`);
        return res.json({
            success: true,
            spreadsheetName,
            sheetName: sheetName || 'Sheet1',
            sheetExists,
            columns: sheetResponse.data.values?.[0] || [],
            message: "Conexão testada com sucesso"
        });
    }
    catch (error) {
        logger_1.default.error("Google Sheets: Erro ao testar conexão:", error);
        // Tratar erros específicos do Google Sheets
        if (error.code === 403) {
            return res.status(403).json({
                error: "Permissão negada. Verifique se o Google Sheets está ativado no seu projeto Google Cloud."
            });
        }
        if (error.code === 404) {
            return res.status(404).json({
                error: "Planilha não encontrada. Verifique o ID da planilha."
            });
        }
        if (error.message?.includes('Unable to parse range')) {
            return res.status(400).json({
                error: "Aba não encontrada. Verifique o nome da aba."
            });
        }
        return res.status(500).json({
            error: error.message || "Erro ao testar conexão com a planilha"
        });
    }
};
exports.testConnection = testConnection;
const executeOperation = async (req, res) => {
    try {
        const { spreadsheetId, sheetName, operation, searchColumn, searchValue, rowData, range, variables, companyId } = req.body;
        if (!companyId) {
            throw new AppError_1.default("CompanyId não fornecido");
        }
        const { client } = await ensureAuthenticatedClient(Number(companyId));
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
        // Substituir variáveis
        const replaceVariables = (text) => {
            if (!variables || !text)
                return text;
            let result = text;
            Object.keys(variables).forEach(key => {
                const placeholder = `{{${key}}}`;
                result = result.split(placeholder).join(variables[key] || '');
            });
            return result;
        };
        let result;
        switch (operation) {
            case 'list':
                const listRange = `${sheetName}!${range || 'A:Z'}`;
                const listResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: listRange,
                });
                const rows = listResponse.data.values || [];
                // Converter para objetos se tiver cabeçalho
                if (rows.length > 0) {
                    const headers = rows[0];
                    const data = rows.slice(1).map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = replaceVariables(row[index] || '');
                        });
                        return obj;
                    });
                    result = data;
                }
                else {
                    result = [];
                }
                break;
            case 'add':
                // Obter cabeçalhos
                const headersResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `${sheetName}!1:1`,
                });
                const headers = headersResponse.data.values?.[0] || [];
                const processedRowData = rowData || {};
                // Preparar valores na ordem das colunas
                const values = headers.map(header => replaceVariables(processedRowData[header]?.toString() || ''));
                const addResponse = await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${sheetName}!A:Z`,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: {
                        values: [values],
                    },
                });
                result = { success: true, updatedRows: addResponse.data.updates?.updatedRows || 0 };
                break;
            case 'search':
                // Listar todos e filtrar
                const searchResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `${sheetName}!${range || 'A:Z'}`,
                });
                const allRows = searchResponse.data.values || [];
                if (allRows.length > 0) {
                    const headers = allRows[0];
                    const searchColIndex = headers.indexOf(searchColumn);
                    if (searchColIndex === -1) {
                        throw new AppError_1.default(`Coluna "${searchColumn}" não encontrada`);
                    }
                    const searchValueProcessed = replaceVariables(searchValue);
                    const filteredData = allRows.slice(1)
                        .filter(row => row[searchColIndex] &&
                        row[searchColIndex].toString().toLowerCase().includes(searchValueProcessed.toLowerCase()))
                        .map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || '';
                        });
                        return obj;
                    });
                    result = filteredData;
                }
                else {
                    result = [];
                }
                break;
            default:
                throw new AppError_1.default(`Operação "${operation}" não implementada`);
        }
        logger_1.default.info(`Google Sheets: Operação "${operation}" executada com sucesso`);
        return res.json({
            success: true,
            operation,
            result,
            message: "Operação executada com sucesso"
        });
    }
    catch (error) {
        logger_1.default.error("Google Sheets: Erro ao executar operação:", error);
        throw new AppError_1.default(`Erro ao executar operação: ${error.message}`);
    }
};
exports.executeOperation = executeOperation;
