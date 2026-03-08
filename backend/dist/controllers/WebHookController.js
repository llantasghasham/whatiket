"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webHook = exports.index = void 0;
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const facebookMessageListener_1 = require("../services/FacebookServices/facebookMessageListener");
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
const index = async (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        }
    }
    return res.status(403).json({
        message: "Forbidden"
    });
};
exports.index = index;
const webHook = async (req, res) => {
    try {
        const { body } = req;
        // Log para verificar que Meta envía eventos
        if (body?.object) {
            const entryCount = body.entry?.length ?? 0;
            const hasMessaging = body.entry?.some((e) => (e.messaging?.length ?? 0) > 0);
            console.log(`[WEBHOOK] POST /webhook - object: ${body.object} | entries: ${entryCount} | hasMessaging: ${hasMessaging}`);
        }
        if (body.object === "page" || body.object === "instagram") {
            let channel;
            if (body.object === "page") {
                channel = "facebook";
            }
            else {
                channel = "instagram";
            }
            for (const entry of body.entry || []) {
                const getTokenPage = await Whatsapp_1.default.findOne({
                    where: {
                        facebookPageUserId: entry.id,
                        channel
                    }
                });
                if (getTokenPage) {
                    console.log(`[WEBHOOK] Page/Insta found for entry.id=${entry.id}, channel=${channel}, companyId=${getTokenPage.companyId}`);
                    for (const data of entry.messaging || []) {
                        await (0, facebookMessageListener_1.handleMessage)(getTokenPage, data, channel, getTokenPage.companyId);
                    }
                }
                else {
                    console.log(`[WEBHOOK] No connection found for entry.id=${entry.id}, channel=${channel}`);
                }
            }
            return res.status(200).json({
                message: "EVENT_RECEIVED"
            });
        }
        return res.status(404).json({
            message: "Webhook object not supported"
        });
    }
    catch (error) {
        console.error("[WebHook] Error:", error?.message || error);
        return res.status(500).json({
            message: error?.message || "Internal error"
        });
    }
};
exports.webHook = webHook;
