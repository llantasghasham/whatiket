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
const express_1 = __importDefault(require("express"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const TranslationController = __importStar(require("../controllers/TranslationController"));
const translationRoutes = express_1.default.Router();
// Public routes (for frontend to load translations on init)
translationRoutes.get("/translations", TranslationController.listAllTranslations);
translationRoutes.get("/translations/languages", TranslationController.listLanguages);
// Language management (super admin only)
translationRoutes.post("/translations/languages", isAuth_1.default, TranslationController.createLanguage);
translationRoutes.put("/translations/languages/:id", isAuth_1.default, TranslationController.updateLanguage);
translationRoutes.delete("/translations/languages/:id", isAuth_1.default, TranslationController.deleteLanguage);
// Translation management
translationRoutes.get("/translations/:language/export", TranslationController.exportTranslations);
translationRoutes.get("/translations/:language", TranslationController.getTranslationsByLanguage);
translationRoutes.put("/translations/:language", isAuth_1.default, TranslationController.saveTranslations);
translationRoutes.post("/translations/:language/import", isAuth_1.default, TranslationController.importTranslations);
// Auto-translate (LibreTranslate)
translationRoutes.post("/translations/:language/auto-translate", isAuth_1.default, TranslationController.autoTranslate);
exports.default = translationRoutes;
