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
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const ProjectController = __importStar(require("../controllers/ProjectController"));
const projectRoutes = (0, express_1.Router)();
// Projects CRUD
projectRoutes.get("/projects", isAuth_1.default, ProjectController.index);
projectRoutes.post("/projects", isAuth_1.default, ProjectController.store);
projectRoutes.get("/projects/:projectId", isAuth_1.default, ProjectController.show);
projectRoutes.put("/projects/:projectId", isAuth_1.default, ProjectController.update);
projectRoutes.delete("/projects/:projectId", isAuth_1.default, ProjectController.remove);
// Tasks
projectRoutes.post("/projects/:projectId/tasks", isAuth_1.default, ProjectController.storeTask);
projectRoutes.put("/projects/tasks/:taskId", isAuth_1.default, ProjectController.updateTask);
projectRoutes.delete("/projects/tasks/:taskId", isAuth_1.default, ProjectController.removeTask);
// Services
projectRoutes.post("/projects/:projectId/services", isAuth_1.default, ProjectController.addService);
projectRoutes.delete("/projects/:projectId/services/:serviceId", isAuth_1.default, ProjectController.removeService);
// Products
projectRoutes.post("/projects/:projectId/products", isAuth_1.default, ProjectController.addProduct);
projectRoutes.delete("/projects/:projectId/products/:productId", isAuth_1.default, ProjectController.removeProduct);
// Users
projectRoutes.post("/projects/:projectId/users", isAuth_1.default, ProjectController.addUser);
projectRoutes.delete("/projects/:projectId/users/:userId", isAuth_1.default, ProjectController.removeUser);
// Task Users
projectRoutes.post("/projects/tasks/:taskId/users", isAuth_1.default, ProjectController.addTaskUser);
projectRoutes.delete("/projects/tasks/:taskId/users/:userId", isAuth_1.default, ProjectController.removeTaskUser);
// User Tasks (tarefas atribuídas a um usuário)
projectRoutes.get("/users/:userId/tasks", isAuth_1.default, ProjectController.listUserTasks);
exports.default = projectRoutes;
