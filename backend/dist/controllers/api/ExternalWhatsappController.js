"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.qrcode = exports.store = exports.disconnect = exports.restart = exports.update = exports.status = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const WhatsappQueue_1 = __importDefault(require("../../models/WhatsappQueue"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const socket_1 = require("../../libs/socket");
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const serializeWhatsapp = (whatsapp) => ({
    id: whatsapp.id,
    name: whatsapp.name,
    number: whatsapp.number,
    status: whatsapp.status,
    channel: whatsapp.channel || "whatsapp",
    isDefault: whatsapp.isDefault,
    allowGroup: whatsapp.allowGroup,
    battery: whatsapp.battery,
    plugged: whatsapp.plugged,
    provider: whatsapp.provider,
    greetingMessage: whatsapp.greetingMessage,
    farewellMessage: whatsapp.farewellMessage,
    complationMessage: whatsapp.complationMessage,
    outOfHoursMessage: whatsapp.outOfHoursMessage,
    queues: whatsapp.queues?.map(q => ({
        id: q.id,
        name: q.name,
        color: q.color
    })) || [],
    createdAt: whatsapp.createdAt,
    updatedAt: whatsapp.updatedAt
});
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const whatsapps = await Whatsapp_1.default.findAll({
        where: {
            companyId,
            channel: "whatsapp"
        },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ],
        order: [["name", "ASC"]]
    });
    return res.json({
        whatsapps: whatsapps.map(serializeWhatsapp)
    });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId,
            channel: "whatsapp"
        },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ]
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    return res.json(serializeWhatsapp(whatsapp));
};
exports.show = show;
const status = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    return res.json({
        id: whatsapp.id,
        name: whatsapp.name,
        number: whatsapp.number,
        status: whatsapp.status,
        battery: whatsapp.battery,
        plugged: whatsapp.plugged,
        qrcode: whatsapp.qrcode,
        retries: whatsapp.retries
    });
};
exports.status = status;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, greetingMessage, farewellMessage, complationMessage, outOfHoursMessage, isDefault, allowGroup, queueIds } = req.body;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId: externalAuth.companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (greetingMessage !== undefined)
        updateData.greetingMessage = greetingMessage;
    if (farewellMessage !== undefined)
        updateData.farewellMessage = farewellMessage;
    if (complationMessage !== undefined)
        updateData.complationMessage = complationMessage;
    if (outOfHoursMessage !== undefined)
        updateData.outOfHoursMessage = outOfHoursMessage;
    if (isDefault !== undefined)
        updateData.isDefault = isDefault;
    if (allowGroup !== undefined)
        updateData.allowGroup = allowGroup;
    await whatsapp.update(updateData);
    // Atualizar filas associadas
    if (queueIds !== undefined && Array.isArray(queueIds)) {
        await WhatsappQueue_1.default.destroy({ where: { whatsappId: whatsapp.id } });
        for (const queueId of queueIds) {
            const queue = await Queue_1.default.findOne({
                where: { id: queueId, companyId: externalAuth.companyId }
            });
            if (queue) {
                await WhatsappQueue_1.default.create({
                    whatsappId: whatsapp.id,
                    queueId
                });
            }
        }
    }
    await whatsapp.reload({
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "whatsapp.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            whatsapp: serializeWhatsapp(whatsapp)
        }
    });
    return res.json(serializeWhatsapp(whatsapp));
};
exports.update = update;
const restart = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId: externalAuth.companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    // Resetar status para forçar reconexão
    await whatsapp.update({
        status: "OPENING",
        qrcode: "",
        retries: 0
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "whatsapp.restarting",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            whatsappId: whatsapp.id,
            name: whatsapp.name
        }
    });
    return res.json({
        message: "Conexão reiniciando...",
        whatsappId: whatsapp.id,
        status: "OPENING"
    });
};
exports.restart = restart;
const disconnect = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId: externalAuth.companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    await whatsapp.update({
        status: "DISCONNECTED",
        session: "",
        qrcode: "",
        retries: 0
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "whatsapp.disconnected",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            whatsappId: whatsapp.id,
            name: whatsapp.name
        }
    });
    return res.json({
        message: "Conexão desconectada",
        whatsappId: whatsapp.id,
        status: "DISCONNECTED"
    });
};
exports.disconnect = disconnect;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, greetingMessage, farewellMessage, complationMessage, outOfHoursMessage, isDefault, allowGroup, queueIds, provider } = req.body;
    if (!name) {
        throw new AppError_1.default("ERR_NAME_REQUIRED", 400);
    }
    // Verificar se já existe uma conexão com esse nome
    const existingWhatsapp = await Whatsapp_1.default.findOne({
        where: { name, companyId: externalAuth.companyId }
    });
    if (existingWhatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NAME_ALREADY_EXISTS", 400);
    }
    // Se for default, remover default das outras
    if (isDefault) {
        await Whatsapp_1.default.update({ isDefault: false }, { where: { companyId: externalAuth.companyId, isDefault: true } });
    }
    const whatsapp = await Whatsapp_1.default.create({
        name,
        companyId: externalAuth.companyId,
        channel: "whatsapp",
        provider: provider || "stable",
        greetingMessage: greetingMessage || "",
        farewellMessage: farewellMessage || "",
        complationMessage: complationMessage || "",
        outOfHoursMessage: outOfHoursMessage || "",
        isDefault: isDefault || false,
        allowGroup: allowGroup || false,
        status: "OPENING",
        retries: 0
    });
    // Associar filas
    if (queueIds && Array.isArray(queueIds)) {
        for (const queueId of queueIds) {
            const queue = await Queue_1.default.findOne({
                where: { id: queueId, companyId: externalAuth.companyId }
            });
            if (queue) {
                await WhatsappQueue_1.default.create({
                    whatsappId: whatsapp.id,
                    queueId
                });
            }
        }
    }
    await whatsapp.reload({
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ]
    });
    // Emitir evento para iniciar conexão
    const io = (0, socket_1.getIO)();
    io.to(`company-${externalAuth.companyId}-mainchannel`).emit(`company-${externalAuth.companyId}-whatsapp`, {
        action: "update",
        whatsapp
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "whatsapp.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            whatsapp: serializeWhatsapp(whatsapp)
        }
    });
    return res.status(201).json({
        ...serializeWhatsapp(whatsapp),
        message: "Conexão criada. Aguarde o QR Code ser gerado."
    });
};
exports.store = store;
const qrcode = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    return res.json({
        id: whatsapp.id,
        name: whatsapp.name,
        status: whatsapp.status,
        qrcode: whatsapp.qrcode || null,
        retries: whatsapp.retries,
        message: whatsapp.qrcode
            ? "QR Code disponível. Escaneie com o WhatsApp."
            : whatsapp.status === "CONNECTED"
                ? "Conexão já está ativa."
                : "QR Code ainda não foi gerado. Aguarde alguns segundos."
    });
};
exports.qrcode = qrcode;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const whatsapp = await Whatsapp_1.default.findOne({
        where: {
            id: Number(id),
            companyId: externalAuth.companyId,
            channel: "whatsapp"
        }
    });
    if (!whatsapp) {
        throw new AppError_1.default("ERR_WHATSAPP_NOT_FOUND", 404);
    }
    // Remover associações
    await WhatsappQueue_1.default.destroy({ where: { whatsappId: whatsapp.id } });
    await whatsapp.destroy();
    // Emitir evento de remoção
    const io = (0, socket_1.getIO)();
    io.to(`company-${externalAuth.companyId}-mainchannel`).emit(`company-${externalAuth.companyId}-whatsapp`, {
        action: "delete",
        whatsappId: Number(id)
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "whatsapp.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            whatsappId: Number(id)
        }
    });
    return res.json({ message: "Conexão removida com sucesso" });
};
exports.remove = remove;
