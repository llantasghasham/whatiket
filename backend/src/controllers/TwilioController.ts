import { Request, Response } from "express";
import twilio from "twilio";

/**
 * Genera un Access Token de Twilio para el Voice SDK en el navegador.
 * Requiere: TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_TWIML_APP_SID
 */
export const getToken = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, name } = req.user;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
    return res.status(500).json({
      error: "Twilio no está configurado. Configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET y TWILIO_TWIML_APP_SID en las variables de entorno.",
    });
  }

  try {
    const identity = `user_${companyId}_${userId}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 121);
    const accessToken = new twilio.jwt.AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity,
      ttl: 3600,
    });

    const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    return res.json({
      token: accessToken.toJwt(),
      identity,
    });
  } catch (err) {
    console.error("[Twilio] Error generando token:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Error al generar token de Twilio",
    });
  }
};

/**
 * Webhook TwiML para llamadas salientes.
 * Twilio llama a esta URL cuando el usuario inicia una llamada desde el Device.
 * La URL debe configurarse como Voice URL en la TwiML App de Twilio.
 */
export const voiceWebhook = async (req: Request, res: Response): Promise<Response> => {
  const to = req.body.To || req.query.To;
  const companyId = req.body.CompanyId || req.query.CompanyId;
  const userId = req.body.UserId || req.query.UserId;
  const callerId = process.env.TWILIO_CALLER_ID || process.env.TWILIO_PHONE_NUMBER;

  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  const statusCallback = `${baseUrl}/twilio/status${companyId && userId ? `?companyId=${encodeURIComponent(companyId)}&userId=${encodeURIComponent(userId)}` : ""}`;

  if (!to) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="es-ES">No se especificó número para llamar.</Say><Hangup/></Response>`;
    res.type("text/xml");
    return res.send(twiml);
  }

  if (!callerId) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="es-ES">Error de configuración. Configure TWILIO_CALLER_ID o TWILIO_PHONE_NUMBER.</Say><Hangup/></Response>`;
    res.type("text/xml");
    return res.send(twiml);
  }

  // Formatear número: asegurar formato E.164
  let dialNumber = String(to).replace(/[^\d+]/g, "");
  if (!dialNumber.startsWith("+")) {
    dialNumber = `+${dialNumber}`;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${escapeXmlAttr(callerId)}" timeout="30" statusCallback="${escapeXmlAttr(statusCallback)}" statusCallbackEvent="answered completed">
    <Number>${escapeXmlText(dialNumber)}</Number>
  </Dial>
</Response>`;

  res.type("text/xml");
  return res.send(twiml);
};

function escapeXmlAttr(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeXmlText(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Webhook de estado de Twilio. Se llama cuando una llamada termina.
 * Crea/actualiza el registro en CallRecord para el historial.
 */
export const statusWebhook = async (req: Request, res: Response): Promise<Response> => {
  const callSid = req.body.CallSid || req.query.CallSid;
  const callStatus = req.body.CallStatus || req.query.CallStatus;
  const duration = parseInt(String(req.body.Duration || req.query.Duration || "0"), 10);
  const to = req.body.To || req.query.To;
  const from = req.body.From || req.query.From;
  const companyId = req.body.CompanyId || req.query.CompanyId;
  const userId = req.body.UserId || req.query.UserId;

  if (!callSid) {
    return res.status(400).send("Missing CallSid");
  }

  // Responder 200 rápido a Twilio
  res.status(200).send("OK");

  if (!companyId || !userId) {
    console.warn("[Twilio Status] Sin companyId/userId, no se registra en CallRecord");
    return res;
  }

  try {
    const CallRecord = (await import("../models/CallRecord")).default;
    const statusMap: Record<string, string> = {
      completed: "answered",
      busy: "busy",
      failed: "failed",
      "no-answer": "missed",
      canceled: "rejected",
    };
    const status = statusMap[callStatus] || "failed";

    const [record, created] = await CallRecord.findOrCreate({
      where: { callId: callSid, companyId: Number(companyId) },
      defaults: {
        callId: callSid,
        type: "outgoing",
        status,
        fromNumber: from || "",
        toNumber: to || "",
        duration,
        contactId: null,
        whatsappId: null,
        ticketId: null,
        userId: Number(userId),
        companyId: Number(companyId),
        callStartedAt: new Date(Date.now() - duration * 1000),
        callEndedAt: new Date(),
      },
    });

    if (!created) {
      await record.update({ status, duration, callEndedAt: new Date() });
    }
  } catch (err) {
    console.error("[Twilio Status] Error registrando llamada:", err);
  }

  return res;
};
