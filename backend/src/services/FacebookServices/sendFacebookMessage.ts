import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendText } from "./graphAPI";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

/** Obtiene PSID desde mensajes entrantes si contact.number no es válido */
const getPsidFromMessages = async (ticketId: number): Promise<string | null> => {
  const msg = await Message.findOne({
    where: { ticketId, fromMe: false },
    order: [["id", "DESC"]],
    attributes: ["dataJson"]
  });
  if (!msg?.dataJson) return null;
  try {
    const data = typeof msg.dataJson === "string" ? JSON.parse(msg.dataJson) : msg.dataJson;
    const psid = data?.sender?.id;
    return psid && /^\d+$/.test(String(psid)) ? String(psid) : null;
  } catch {
    return null;
  }
};

const sendFacebookMessage = async ({ body, ticket, quotedMsg }: Request): Promise<any> => {
  const conn = ticket.whatsapp;
  const token = conn?.facebookUserToken;
  const connName = conn?.name || "?";
  const connId = conn?.id;
  const pageId = conn?.facebookPageUserId || "?";
  const channel = ticket.channel || conn?.channel || "?";

  // Para Facebook/Instagram, recipient.id debe ser el PSID (Page-Scoped ID), no teléfono
  let recipientId = ticket.contact?.number;
  if (recipientId != null) {
    recipientId = String(recipientId).trim();
  }
  const isValidPsid = recipientId && recipientId !== "undefined" && recipientId !== "null" && /^\d+$/.test(recipientId);

  // Fallback: si contact.number no es PSID válido, intentar obtenerlo de mensajes entrantes
  if (!isValidPsid) {
    const psidFromMsg = await getPsidFromMessages(ticket.id);
    if (psidFromMsg) {
      recipientId = psidFromMsg;
      console.log("[FB_SEND] Usando PSID desde mensaje entrante | ticketId:", ticket.id, "| psid:", recipientId);
      // Actualizar contacto para futuros envíos
      if (ticket.contact?.id) {
        const Contact = (await import("../../models/Contact")).default;
        await Contact.update({ number: psidFromMsg }, { where: { id: ticket.contact.id } });
      }
    }
  }

  if (!recipientId || recipientId === "undefined" || recipientId === "null") {
    console.error("[FB_SEND] ABORT - recipient[id] inválido | contactId:", ticket.contact?.id, "| number:", ticket.contact?.number);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG: Param recipient[id] must be a valid ID string. El contacto no tiene PSID de Facebook/Instagram.");
  }
  if (!/^\d+$/.test(recipientId)) {
    console.error("[FB_SEND] ABORT - recipient no es PSID válido (debe ser numérico) | contact.number:", recipientId);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG: El contacto tiene número de teléfono en lugar de PSID. Solo se puede responder a contactos que escribieron por Facebook/Instagram.");
  }

  const tokenPreview = token
    ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
    : "NULL";
  console.log("[FB_SEND] INICIO | channel:", channel, "| conexion:", connName, "(id:", connId, ")", "| pageId:", pageId, "| recipient:", recipientId, "| token:", tokenPreview);

  if (!token) {
    console.error("[FB_SEND] ABORT - Conexión sin token | conexion:", connName, "| ticketId:", ticket.id);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }

  try {
    const send = await sendText(recipientId, formatBody(body, ticket), token);
    await ticket.update({ lastMessage: body });
    console.log("[FB_SEND] OK | conexion:", connName, "| recipient:", recipientId);
    return send;
  } catch (err: any) {
    const metaData = err?.response?.data?.error || {};
    const metaMsg = metaData.message || err?.message;
    const metaCode = metaData.code || err?.response?.status;
    const metaSubcode = metaData.error_subcode;
    console.error("[FB_SEND] FAIL | conexion:", connName, "| recipient:", recipientId, "| code:", metaCode, "| subcode:", metaSubcode, "| Meta:", metaMsg);
    console.error("[FB_SEND] error.response.data:", JSON.stringify(err?.response?.data || {}));
    // Pasar mensaje de Meta al frontend para diagnóstico
    const userMsg = metaMsg || "Error al enviar mensaje a Facebook/Instagram";
    throw new AppError(`ERR_SENDING_FACEBOOK_MSG: ${userMsg}`);
  }
};

export default sendFacebookMessage;
