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
const express_1 = require("express");
const isAuthExternal_1 = __importDefault(require("../../middleware/isAuthExternal"));
const ExternalUserController = __importStar(require("../../controllers/api/ExternalUserController"));
const externalUserRoutes = (0, express_1.Router)();
externalUserRoutes.get("/users", isAuthExternal_1.default, ExternalUserController.index);
externalUserRoutes.get("/users/:id", isAuthExternal_1.default, ExternalUserController.show);
externalUserRoutes.post("/users", isAuthExternal_1.default, ExternalUserController.store);
externalUserRoutes.put("/users/:id", isAuthExternal_1.default, ExternalUserController.update);
externalUserRoutes.delete("/users/:id", isAuthExternal_1.default, ExternalUserController.remove);
// ==================== SERVIÇOS DO USUÁRIO ====================
externalUserRoutes.get("/users/:id/services", isAuthExternal_1.default, ExternalUserController.listServices);
externalUserRoutes.post("/users/:id/services", isAuthExternal_1.default, ExternalUserController.addServices);
externalUserRoutes.put("/users/:id/services", isAuthExternal_1.default, ExternalUserController.setServices);
externalUserRoutes.delete("/users/:id/services", isAuthExternal_1.default, ExternalUserController.removeServices);
// ==================== AGENDA DO USUÁRIO ====================
externalUserRoutes.get("/users/:id/schedule", isAuthExternal_1.default, ExternalUserController.getSchedule);
externalUserRoutes.post("/users/:id/schedule", isAuthExternal_1.default, ExternalUserController.createSchedule);
externalUserRoutes.put("/users/:id/schedule", isAuthExternal_1.default, ExternalUserController.updateSchedule);
// ==================== COMPROMISSOS DO USUÁRIO ====================
externalUserRoutes.get("/users/:id/appointments", isAuthExternal_1.default, ExternalUserController.listAppointments);
externalUserRoutes.post("/users/:id/appointments", isAuthExternal_1.default, ExternalUserController.createAppointment);
externalUserRoutes.put("/users/:id/appointments/:appointmentId", isAuthExternal_1.default, ExternalUserController.updateAppointment);
externalUserRoutes.delete("/users/:id/appointments/:appointmentId", isAuthExternal_1.default, ExternalUserController.deleteAppointment);
externalUserRoutes.patch("/users/:id/appointments/:appointmentId/status", isAuthExternal_1.default, ExternalUserController.updateAppointmentStatus);
exports.default = externalUserRoutes;
