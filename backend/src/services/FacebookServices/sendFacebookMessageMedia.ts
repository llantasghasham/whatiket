import fs from "fs";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendAttachmentFromUrl } from "./graphAPI";
import { getBackendUrl } from "../SettingService/UrlService";
// import { verifyMessage } from "./facebookMessageListener";

interface Request {
  ticket: Ticket;
  media?: Express.Multer.File;
  body?: string;
  url?: string;
}

/** Obtiene PSID desde mensajes entrantes (misma lógica que sendFacebookMessage) */
const getPsidFromMessages = async (ticketId: number): Promise<string | null> => {
  const messages = await Message.findAll({
    where: { ticketId, fromMe: false },
    order: [["id", "DESC"]],
    attributes: ["dataJson"],
    limit: 10
  });
  for (const msg of messages) {
    if (!msg?.dataJson) continue;
    try {
      const data = typeof msg.dataJson === "string" ? JSON.parse(msg.dataJson) : msg.dataJson;
      const psid = data?.sender?.id ?? data?.senderId ?? data?.sender_id;
      if (psid && /^\d+$/.test(String(psid))) return String(psid);
    } catch {
      continue;
    }
  }
  return null;
};

const resolveRecipientId = async (ticket: Ticket): Promise<string> => {
  let recipientId = ticket.contact?.number ? String(ticket.contact.number).trim() : "";
  const isValidPsid = recipientId && recipientId !== "undefined" && recipientId !== "null" && /^\d+$/.test(recipientId);
  if (!isValidPsid) {
    const psidFromMsg = await getPsidFromMessages(ticket.id);
    if (psidFromMsg) {
      recipientId = psidFromMsg;
      if (ticket.contact?.id) {
        const Contact = (await import("../../models/Contact")).default;
        await Contact.update({ number: psidFromMsg }, { where: { id: ticket.contact.id } });
      }
    }
  }
  if (!recipientId || !/^\d+$/.test(recipientId)) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG: El contacto no tiene PSID válido. Pida al usuario que envíe un nuevo mensaje por Facebook/Instagram.");
  }
  return recipientId;
};

export const typeAttachment = (media: Express.Multer.File) => {
  if (media.mimetype.includes("image")) {
    return "image";
  }
  if (media.mimetype.includes("video")) {
    return "video";
  }
  if (media.mimetype.includes("audio")) {
    return "audio";
  }

  return "file";
};

export const sendFacebookMessageMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const recipientId = await resolveRecipientId(ticket);
    const type = typeAttachment(media);

    const backendUrl = await getBackendUrl(ticket.companyId);
    const domain = `${backendUrl}/public/company${ticket.companyId}/${media.filename}`


    const sendMessage = await sendAttachmentFromUrl(
      recipientId,
      domain,
      type,
      ticket.whatsapp.facebookUserToken
    );

    await ticket.update({ lastMessage: media.filename });

    fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageMediaExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const recipientId = await resolveRecipientId(ticket);
    const type = "image"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      recipientId,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.jpg}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageFileExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const recipientId = await resolveRecipientId(ticket);
    const type = "file"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      recipientId,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.pdf}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};