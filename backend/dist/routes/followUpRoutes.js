"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const FollowUpController_1 = __importDefault(require("../controllers/FollowUpController"));
const router = (0, express_1.Router)();
router.post("/follow-up", isAuth_1.default, (req, res) => FollowUpController_1.default.create(req, res));
router.get("/follow-up/:ticketId", isAuth_1.default, (req, res) => FollowUpController_1.default.list(req, res));
router.delete("/follow-up/:followUpId", isAuth_1.default, (req, res) => FollowUpController_1.default.cancel(req, res));
router.post("/follow-up/:ticketId/reset", isAuth_1.default, (req, res) => FollowUpController_1.default.resetTicket(req, res));
router.post("/follow-up/process", isAuth_1.default, (req, res) => FollowUpController_1.default.processPending(req, res));
exports.default = router;
