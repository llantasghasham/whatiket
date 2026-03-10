import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleTelegramUpdate } from "../services/TelegramServices/telegramMessageListener";
import axios from "axios";

const TELEGRAM_API = "https://api.telegram.org/bot";

export const webhook = async (req: Request, res: Response): Promise<Response> => {
  const { connectionId } = req.params;
  const update = req.body;

  if (!update || !connectionId) {
    return res.status(400).send("Bad request");
  }

  const connection = await Whatsapp.findOne({
    where: { id: connectionId, channel: "telegram" }
  });

  if (!connection || !connection.token) {
    return res.status(200).send("OK");
  }

  res.status(200).send("OK");

  try {
    await handleTelegramUpdate(connection, update);
  } catch (err) {
    console.error("[Telegram] Error handling update:", err);
  }

  return res;
};

export const setWebhook = async (req: Request, res: Response): Promise<Response> => {
  const { connectionId } = req.params;
  const { companyId } = req.user;

  const connection = await Whatsapp.findOne({
    where: { id: connectionId, companyId, channel: "telegram" }
  });

  if (!connection || !connection.token) {
    return res.status(404).json({ error: "Conexión Telegram no encontrada" });
  }

  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  const webhookUrl = `${baseUrl}/telegram-webhook/${connectionId}`;

  try {
    const url = `${TELEGRAM_API}${connection.token}/setWebhook`;
    const { data } = await axios.post(url, { url: webhookUrl });

    if (!data.ok) {
      return res.status(400).json({ error: data.description || "Error al configurar webhook" });
    }

    return res.json({ ok: true, webhookUrl });
  } catch (err: any) {
    console.error("[Telegram] setWebhook error:", err?.response?.data || err);
    return res.status(500).json({
      error: err?.response?.data?.description || err?.message || "Error al configurar webhook"
    });
  }
};
