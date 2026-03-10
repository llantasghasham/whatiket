import express from "express";
import isAuth from "../middleware/isAuth";
import * as TwilioController from "../controllers/TwilioController";

const twilioRoutes = express.Router();

// Token para el Voice SDK (requiere autenticación)
twilioRoutes.post("/twilio/token", isAuth, TwilioController.getToken);

// Webhook TwiML - Twilio llama a esta URL (sin auth, Twilio no envía Bearer)
twilioRoutes.get("/twilio/voice", TwilioController.voiceWebhook);
twilioRoutes.post("/twilio/voice", TwilioController.voiceWebhook);

// Webhook de estado - Twilio notifica cuando la llamada termina (registra en historial)
twilioRoutes.get("/twilio/status", TwilioController.statusWebhook);
twilioRoutes.post("/twilio/status", TwilioController.statusWebhook);

export default twilioRoutes;
