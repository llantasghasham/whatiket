import axios from "axios";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import CreateMessageService from "../MessageServices/CreateMessageService";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  connection?: { id?: number; name?: string; token?: string; channel?: string };
}

export const sendTelegramMessage = async ({ body, ticket, quotedMsg, connection }: Request): Promise<any> => {
  const conn = connection || ticket.whatsapp;
  const token = conn?.token;
  const chatId = ticket.contact?.number;

  if (!token) {
    throw new Error("ERR_TELEGRAM: Conexión sin token de bot.");
  }
  if (!chatId) {
    throw new Error("ERR_TELEGRAM: Contacto sin chat_id.");
  }

  let text = formatBody(body, ticket);
  // Convertir formato WhatsApp (*negrita*, _cursiva_) a HTML de Telegram
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*([^*]+)\*/g, "<b>$1</b>")
    .replace(/_([^_]+)_/g, "<i>$1</i>")
    .replace(/~([^~]+)~/g, "<s>$1</s>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  const url = `${TELEGRAM_API}${token}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  });

  const result = response.data?.result;
  if (!result) {
    throw new Error("ERR_TELEGRAM: No se recibió respuesta al enviar.");
  }

  await ticket.update({ lastMessage: body });

  return result;
};

export default sendTelegramMessage;
