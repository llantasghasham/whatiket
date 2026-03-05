"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserPagePermissionService_1 = __importDefault(require("../services/UserPagePermissionService"));
class UserPagePermissionController {
    // Lista todas as páginas disponíveis no sistema
    static async listAvailablePages(req, res) {
        try {
            const pages = UserPagePermissionService_1.default.getAvailablePages();
            // Organiza por grupos
            const groupedPages = pages.reduce((acc, page) => {
                if (!acc[page.group]) {
                    acc[page.group] = [];
                }
                acc[page.group].push(page);
                return acc;
            }, {});
            res.json({ pages: groupedPages });
        }
        catch (error) {
            console.error("Erro ao listar páginas disponíveis:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // Obtém permissões de um usuário específico
    static async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            if (!userId || isNaN(Number(userId))) {
                return res.status(400).json({ error: "ID do usuário inválido" });
            }
            const permissions = await UserPagePermissionService_1.default.getUserPagePermissions(Number(userId));
            res.json(permissions);
        }
        catch (error) {
            console.error("Erro ao obter permissões do usuário:", error);
            if (error instanceof Error && error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // Define permissões de um usuário
    static async setUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            const { permissions, pagePermissionsMode } = req.body;
            if (!userId || isNaN(Number(userId))) {
                return res.status(400).json({ error: "ID do usuário inválido" });
            }
            if (!pagePermissionsMode || !["inherit", "custom"].includes(pagePermissionsMode)) {
                return res.status(400).json({ error: "Modo de permissões inválido" });
            }
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ error: "Permissões devem ser um array" });
            }
            // Validação das permissões
            const availablePages = UserPagePermissionService_1.default.getAvailablePages();
            const availablePaths = new Set(availablePages.map(p => p.path));
            for (const permission of permissions) {
                if (!permission.pagePath || typeof permission.canAccess !== "boolean") {
                    return res.status(400).json({ error: "Formato de permissão inválido" });
                }
                if (!availablePaths.has(permission.pagePath)) {
                    return res.status(400).json({ error: `Página inválida: ${permission.pagePath}` });
                }
            }
            const result = await UserPagePermissionService_1.default.setUserPagePermissions({
                userId: Number(userId),
                permissions,
                pagePermissionsMode
            });
            res.json(result);
        }
        catch (error) {
            console.error("Erro ao definir permissões do usuário:", error);
            if (error instanceof Error && error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // Verifica se um usuário tem acesso a uma página específica (endpoint utilitário)
    static async checkPageAccess(req, res) {
        try {
            const userId = req.user?.id;
            const { pagePath } = req.query;
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado" });
            }
            if (!pagePath || typeof pagePath !== "string") {
                return res.status(400).json({ error: "Caminho da página inválido" });
            }
            const canAccess = await UserPagePermissionService_1.default.canUserAccessPage(Number(userId), pagePath);
            res.json({ canAccess, pagePath });
        }
        catch (error) {
            console.error("Erro ao verificar acesso à página:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // Obtém páginas que um usuário pode acessar (para montar o menu)
    static async getUserAccessiblePages(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado" });
            }
            const pages = await UserPagePermissionService_1.default.getUserAccessiblePages(Number(userId));
            // Organiza por grupos
            const groupedPages = pages.reduce((acc, page) => {
                if (!acc[page.group]) {
                    acc[page.group] = [];
                }
                acc[page.group].push(page);
                return acc;
            }, {});
            res.json({ pages: groupedPages });
        }
        catch (error) {
            console.error("Erro ao obter páginas acessíveis:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
}
exports.default = UserPagePermissionController;
