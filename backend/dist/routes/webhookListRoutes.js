"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const WebhookListController_1 = require("../controllers/WebhookListController");
const router = (0, express_1.Router)();
router.get("/webhooks", isAuth_1.default, WebhookListController_1.list);
exports.default = router;
