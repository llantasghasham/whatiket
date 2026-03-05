"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EmailController_1 = require("../controllers/EmailController");
const emailRoutes = express_1.default.Router();
emailRoutes.post("/send-crm-email", EmailController_1.sendCrmEmail);
exports.default = emailRoutes;
