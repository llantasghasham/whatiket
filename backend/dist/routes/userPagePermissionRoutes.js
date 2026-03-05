"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserPagePermissionController_1 = __importDefault(require("../controllers/UserPagePermissionController"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const router = (0, express_1.Router)();
// Lista todas as páginas disponíveis no sistema
router.get("/pages/list", isAuth_1.default, UserPagePermissionController_1.default.listAvailablePages);
// Obtém permissões de um usuário específico
router.get("/users/:userId/page-permissions", isAuth_1.default, UserPagePermissionController_1.default.getUserPermissions);
// Define permissões de um usuário
router.post("/users/:userId/page-permissions", isAuth_1.default, UserPagePermissionController_1.default.setUserPermissions);
// Verifica se o usuário atual tem acesso a uma página específica
router.get("/check-page-access", isAuth_1.default, UserPagePermissionController_1.default.checkPageAccess);
// Obtém páginas que o usuário atual pode acessar (para montar o menu)
router.get("/user-accessible-pages", isAuth_1.default, UserPagePermissionController_1.default.getUserAccessiblePages);
exports.default = router;
