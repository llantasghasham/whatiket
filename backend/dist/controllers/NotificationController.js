"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNewMessage = exports.sendPushNotification = exports.unregisterDevice = exports.registerDevice = void 0;
const socket_1 = require("../libs/socket");
const Ticket_1 = __importDefault(require("../models/Ticket"));
const User_1 = __importDefault(require("../models/User"));
const UserDevice_1 = __importDefault(require("../models/UserDevice"));
const Contact_1 = __importDefault(require("../models/Contact"));
// Serviço para registrar dispositivo móvel para notificações
const registerDevice = async (req, res) => {
    try {
        const { deviceToken, platform } = req.body;
        const userId = req.user.id;
        if (!deviceToken || !platform) {
            throw new Error("ERR_MISSING_DEVICE_INFO");
        }
        // Verificar se já existe dispositivo registrado
        const existingDevice = await UserDevice_1.default.findOne({
            where: { userId, deviceToken }
        });
        if (existingDevice) {
            // Atualizar dispositivo existente
            await existingDevice.update({ platform, updatedAt: new Date() });
        }
        else {
            // Criar novo registro de dispositivo
            await UserDevice_1.default.create({
                userId,
                deviceToken,
                platform,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        return res.status(200).json({ success: true, message: "Device registered successfully" });
    }
    catch (error) {
        console.error("Error registering device:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.registerDevice = registerDevice;
// Serviço para remover dispositivo
const unregisterDevice = async (req, res) => {
    try {
        const { deviceToken } = req.body;
        const userId = req.user.id;
        await UserDevice_1.default.destroy({
            where: { userId, deviceToken }
        });
        return res.status(200).json({ success: true, message: "Device unregistered successfully" });
    }
    catch (error) {
        console.error("Error unregistering device:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.unregisterDevice = unregisterDevice;
// Função para enviar notificação push para dispositivos móveis
const sendPushNotification = async (userId, title, body, data) => {
    try {
        // Buscar dispositivos do usuário
        const devices = await UserDevice_1.default.findAll({
            where: { userId }
        });
        if (devices.length === 0) {
            return;
        }
        // Agrupar dispositivos por plataforma
        const androidDevices = devices.filter(d => d.platform === 'android').map(d => d.deviceToken);
        const iosDevices = devices.filter(d => d.platform === 'ios').map(d => d.deviceToken);
        // Enviar notificações (implementar com Firebase Cloud Messaging ou similar)
        if (androidDevices.length > 0) {
            // Implementar envio para Android
            console.log(`Sending push notification to Android devices: ${androidDevices.join(', ')}`);
        }
        if (iosDevices.length > 0) {
            // Implementar envio para iOS
            console.log(`Sending push notification to iOS devices: ${iosDevices.join(', ')}`);
        }
    }
    catch (error) {
        console.error("Error sending push notification:", error);
    }
};
exports.sendPushNotification = sendPushNotification;
// Middleware para enviar notificação quando nova mensagem chega
const notifyNewMessage = async (message) => {
    try {
        // Buscar ticket e usuário associado
        const ticket = await Ticket_1.default.findByPk(message.ticketId, {
            include: [
                { model: User_1.default, as: 'user' },
                { model: Contact_1.default, as: 'contact' }
            ]
        });
        if (!ticket || !ticket.user) {
            return;
        }
        // Enviar notificação push
        await (0, exports.sendPushNotification)(ticket.user.id, `Nova mensagem de ${ticket.contact?.name || 'Contato'}`, message.body || 'Nova mensagem', {
            ticketId: ticket.id,
            messageId: message.id,
            contactId: ticket.contactId
        });
        // Emitir evento WebSocket para web
        const io = (0, socket_1.getIO)();
        io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-message`, {
            action: "create",
            message,
            ticket: {
                id: ticket.id,
                userId: ticket.userId,
                contactId: ticket.contactId
            }
        });
    }
    catch (error) {
        console.error("Error notifying new message:", error);
    }
};
exports.notifyNewMessage = notifyNewMessage;
