import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import Ticket from "../../models/Ticket";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
  connection: { id?: number; name?: string; token?: string; channel?: string };
}

const getMediaType = (mimetype: string): "photo" | "video" | "audio" | "document" => {
  if (mimetype.includes("image")) return "photo";
  if (mimetype.includes("video")) return "video";
  if (mimetype.includes("audio")) return "audio";
  return "document";
};

export const sendTelegramMedia = async ({
  media,
  ticket,
  body = "",
  connection
}: Request): Promise<any> => {
  const token = connection?.token;
  const chatId = ticket.contact?.number;

  if (!token) {
    throw new Error("ERR_TELEGRAM: Conexión sin token de bot.");
  }
  if (!chatId) {
    throw new Error("ERR_TELEGRAM: Contacto sin chat_id.");
  }

  const mediaType = getMediaType(media.mimetype);
  const methodMap = {
    photo: "sendPhoto",
    video: "sendVideo",
    audio: "sendAudio",
    document: "sendDocument"
  };
  const method = methodMap[mediaType];
  const fieldName = mediaType === "document" ? "document" : mediaType;

  const filePath = media.path || path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`, media.filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`ERR_TELEGRAM: Archivo no encontrado: ${filePath}`);
  }

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append(fieldName, fs.createReadStream(filePath), {
    filename: media.originalname || media.filename
  });
  if (body && body.trim()) {
    form.append("caption", body);
    form.append("parse_mode", "HTML");
  }

  const url = `${TELEGRAM_API}${token}/${method}`;
  const response = await axios.post(url, form, {
    headers: form.getHeaders()
  });

  const result = response.data?.result;
  if (!result) {
    throw new Error("ERR_TELEGRAM: No se recibió respuesta al enviar media.");
  }

  await ticket.update({ lastMessage: body || media.filename });

  return result;
};

export default sendTelegramMedia;
