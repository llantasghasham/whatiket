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

const sendFacebookMessage = async ({ body, ticket, quotedMsg }: Request): Promise<any> => {
  const { number } = ticket.contact;
  const conn = ticket.whatsapp;
  const token = conn?.facebookUserToken;
  const connName = conn?.name || "?";
  const connId = conn?.id;
  const pageId = conn?.facebookPageUserId || "?";
  const channel = ticket.channel || conn?.channel || "?";

  // Log obligatorio pre-envío
  const tokenPreview = token
    ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
    : "NULL";
  console.log("[FB_SEND] INICIO | channel:", channel, "| conexion:", connName, "(id:", connId, ")", "| pageId:", pageId, "| recipient:", number, "| token:", tokenPreview);

  if (!token) {
    console.error("[FB_SEND] ABORT - Conexión sin token | conexion:", connName, "| ticketId:", ticket.id);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }

  try {
    const send = await sendText(number, formatBody(body, ticket), token);
    await ticket.update({ lastMessage: body });
    console.log("[FB_SEND] OK | conexion:", connName, "| recipient:", number);
    return send;
  } catch (err: any) {
    const metaData = err?.response?.data?.error || {};
    const metaMsg = metaData.message || err?.message;
    const metaCode = metaData.code || err?.response?.status;
    console.error("[FB_SEND] FAIL | conexion:", connName, "| recipient:", number, "| code:", metaCode, "| Meta:", metaMsg);
    console.error("[FB_SEND] error.response.data:", JSON.stringify(err?.response?.data || {}));
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default sendFacebookMessage;
