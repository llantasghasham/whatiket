import axios from "axios";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getIO } from "../../libs/socket";
import ListSettingsService from "../SettingServices/ListSettingsService";
import CompaniesSettings from "../../models/CompaniesSettings";
import Queue from "../../models/Queue";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    date: number;
    text?: string;
    photo?: any[];
    document?: any;
    voice?: any;
    video?: any;
    audio?: any;
    sticker?: any;
  };
}

const getTelegramProfile = async (token: string, chatId: number): Promise<{ name: string; username?: string }> => {
  try {
    const url = `${TELEGRAM_API}${token}/getChat`;
    const { data } = await axios.post(url, { chat_id: chatId });
    const chat = data?.result;
    if (!chat) return { name: String(chatId) };
    const firstName = chat.first_name || "";
    const lastName = chat.last_name || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || chat.title || String(chatId);
    return { name, username: chat.username };
  } catch {
    return { name: String(chatId) };
  }
};

export const handleTelegramUpdate = async (
  connection: Whatsapp,
  update: TelegramUpdate
): Promise<void> => {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const from = message.from || message.chat;
  const text = message.text || "";
  const companyId = connection.companyId;

  const { name } = await getTelegramProfile(connection.token, chatId);
  const contactData = {
    name: name || `Telegram ${chatId}`,
    number: String(chatId),
    isGroup: message.chat.type === "group" || message.chat.type === "supergroup",
    companyId,
    channel: "telegram",
    whatsappId: connection.id
  };

  const contact = await CreateOrUpdateContactService(contactData);

  const settings = await CompaniesSettings.findOne({ where: { companyId } });
  const queues = await Queue.findAll({ where: { companyId }, limit: 1 });
  const queueId = queues[0]?.id || null;

  const ticket = await FindOrCreateTicketService(
    contact,
    connection,
    1,
    companyId,
    queueId,
    null,
    undefined,
    "telegram"
  );

  const messageData = {
    wid: `tg-${message.message_id}`,
    ticketId: ticket.id,
    contactId: contact.id,
    body: text,
    fromMe: false,
    read: false,
    ack: 1,
    dataJson: JSON.stringify(message),
    channel: "telegram"
  };

  await CreateMessageService({ messageData, companyId: ticket.companyId });

  await ticket.update({
    lastMessage: text,
    unreadMessages: (ticket.unreadMessages || 0) + 1
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });
};
