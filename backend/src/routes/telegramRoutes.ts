import express from "express";
import isAuth from "../middleware/isAuth";
import * as TelegramController from "../controllers/TelegramController";

const telegramRoutes = express.Router();

telegramRoutes.post("/telegram-webhook/:connectionId", TelegramController.webhook);
telegramRoutes.post("/telegram/set-webhook/:connectionId", isAuth, TelegramController.setWebhook);

export default telegramRoutes;
