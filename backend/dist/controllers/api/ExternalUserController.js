"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.listAppointments = exports.updateSchedule = exports.createSchedule = exports.getSchedule = exports.setServices = exports.removeServices = exports.addServices = exports.listServices = exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const User_1 = __importDefault(require("../../models/User"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const UserQueue_1 = __importDefault(require("../../models/UserQueue"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const UserService_1 = __importDefault(require("../../models/UserService"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const sequelize_1 = require("sequelize");
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const serializeUser = (user, includeServices = false) => {
    const result = {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        profileImage: user.profileImage,
        whatsappId: user.whatsappId,
        online: user.online,
        startWork: user.startWork,
        endWork: user.endWork,
        userType: user.userType,
        workDays: user.workDays,
        lunchStart: user.lunchStart,
        lunchEnd: user.lunchEnd,
        color: user.color,
        allTicket: user.allTicket,
        allowGroup: user.allowGroup,
        farewellMessage: user.farewellMessage,
        allHistoric: user.allHistoric,
        allUserChat: user.allUserChat,
        userClosePendingTicket: user.userClosePendingTicket,
        showDashboard: user.showDashboard,
        allowRealTime: user.allowRealTime,
        allowConnections: user.allowConnections,
        queues: user.queues?.map(q => ({ id: q.id, name: q.name, color: q.color })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
    if (includeServices && user.services) {
        result.services = user.services.map(s => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao,
            valorOriginal: s.valorOriginal,
            possuiDesconto: s.possuiDesconto,
            valorComDesconto: s.valorComDesconto
        }));
    }
    return result;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, searchParam, profile } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId };
    if (searchParam) {
        const { Op } = require("sequelize");
        whereCondition[Op.or] = [
            { name: { [Op.iLike]: `%${searchParam}%` } },
            { email: { [Op.iLike]: `%${searchParam}%` } }
        ];
    }
    if (profile) {
        whereCondition.profile = profile;
    }
    const { count, rows: users } = await User_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ],
        attributes: { exclude: ["passwordHash", "tokenVersion"] },
        order: [["name", "ASC"]],
        limit,
        offset
    });
    const hasMore = count > offset + users.length;
    return res.json({
        users: users.map(user => serializeUser(user)),
        count,
        hasMore
    });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"],
                through: { attributes: [] }
            }
        ],
        attributes: { exclude: ["passwordHash", "tokenVersion"] }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    return res.json(serializeUser(user));
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, email, password, profile, whatsappId, startWork, endWork, userType, workDays, lunchStart, lunchEnd, color, allTicket, allowGroup, farewellMessage, allHistoric, allUserChat, userClosePendingTicket, showDashboard, allowRealTime, allowConnections, queueIds } = req.body;
    if (!name) {
        throw new AppError_1.default("ERR_USER_NAME_REQUIRED", 400);
    }
    if (!email) {
        throw new AppError_1.default("ERR_USER_EMAIL_REQUIRED", 400);
    }
    if (!password) {
        throw new AppError_1.default("ERR_USER_PASSWORD_REQUIRED", 400);
    }
    // Verificar se email já existe na empresa
    const existingUser = await User_1.default.findOne({
        where: { email, companyId: externalAuth.companyId }
    });
    if (existingUser) {
        throw new AppError_1.default("ERR_USER_EMAIL_ALREADY_EXISTS", 400);
    }
    const user = await User_1.default.create({
        name,
        email,
        password,
        profile: profile || "user",
        whatsappId: whatsappId || null,
        startWork: startWork || "00:00",
        endWork: endWork || "23:59",
        userType: userType || "attendant",
        workDays: workDays || "1,2,3,4,5",
        lunchStart: lunchStart || null,
        lunchEnd: lunchEnd || null,
        color: color || "",
        allTicket: allTicket || "disable",
        allowGroup: allowGroup || false,
        farewellMessage: farewellMessage || "",
        allHistoric: allHistoric || "disabled",
        allUserChat: allUserChat || "disabled",
        userClosePendingTicket: userClosePendingTicket || "enabled",
        showDashboard: showDashboard || "disabled",
        allowRealTime: allowRealTime || "disable",
        allowConnections: allowConnections || "disable",
        companyId: externalAuth.companyId
    });
    // Adicionar filas ao usuário
    if (queueIds && Array.isArray(queueIds)) {
        for (const queueId of queueIds) {
            await UserQueue_1.default.create({
                userId: user.id,
                queueId
            });
        }
    }
    await user.reload({
        include: [
            { model: Queue_1.default, as: "queues", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ],
        attributes: { exclude: ["passwordHash", "tokenVersion"] }
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            user: serializeUser(user)
        }
    });
    return res.status(201).json(serializeUser(user));
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, email, password, profile, whatsappId, startWork, endWork, userType, workDays, lunchStart, lunchEnd, color, allTicket, allowGroup, farewellMessage, allHistoric, allUserChat, userClosePendingTicket, showDashboard, allowRealTime, allowConnections, queueIds } = req.body;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    // Verificar se email já existe em outro usuário
    if (email && email !== user.email) {
        const existingUser = await User_1.default.findOne({
            where: { email, companyId: externalAuth.companyId }
        });
        if (existingUser && existingUser.id !== user.id) {
            throw new AppError_1.default("ERR_USER_EMAIL_ALREADY_EXISTS", 400);
        }
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (email !== undefined)
        updateData.email = email;
    if (password !== undefined)
        updateData.password = password;
    if (profile !== undefined)
        updateData.profile = profile;
    if (whatsappId !== undefined)
        updateData.whatsappId = whatsappId;
    if (startWork !== undefined)
        updateData.startWork = startWork;
    if (endWork !== undefined)
        updateData.endWork = endWork;
    if (userType !== undefined)
        updateData.userType = userType;
    if (workDays !== undefined)
        updateData.workDays = workDays;
    if (lunchStart !== undefined)
        updateData.lunchStart = lunchStart;
    if (lunchEnd !== undefined)
        updateData.lunchEnd = lunchEnd;
    if (color !== undefined)
        updateData.color = color;
    if (allTicket !== undefined)
        updateData.allTicket = allTicket;
    if (allowGroup !== undefined)
        updateData.allowGroup = allowGroup;
    if (farewellMessage !== undefined)
        updateData.farewellMessage = farewellMessage;
    if (allHistoric !== undefined)
        updateData.allHistoric = allHistoric;
    if (allUserChat !== undefined)
        updateData.allUserChat = allUserChat;
    if (userClosePendingTicket !== undefined)
        updateData.userClosePendingTicket = userClosePendingTicket;
    if (showDashboard !== undefined)
        updateData.showDashboard = showDashboard;
    if (allowRealTime !== undefined)
        updateData.allowRealTime = allowRealTime;
    if (allowConnections !== undefined)
        updateData.allowConnections = allowConnections;
    await user.update(updateData);
    // Atualizar filas se fornecido
    if (queueIds !== undefined && Array.isArray(queueIds)) {
        await UserQueue_1.default.destroy({ where: { userId: user.id } });
        for (const queueId of queueIds) {
            await UserQueue_1.default.create({
                userId: user.id,
                queueId
            });
        }
    }
    await user.reload({
        include: [
            { model: Queue_1.default, as: "queues", attributes: ["id", "name", "color"], through: { attributes: [] } }
        ],
        attributes: { exclude: ["passwordHash", "tokenVersion"] }
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            user: serializeUser(user)
        }
    });
    return res.json(serializeUser(user));
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    // Remover filas do usuário
    await UserQueue_1.default.destroy({ where: { userId: user.id } });
    await user.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
// ==================== SERVIÇOS DO USUÁRIO ====================
const listServices = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: Servico_1.default,
                as: "services",
                through: { attributes: [] }
            }
        ]
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    return res.json({
        services: user.services?.map(s => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao,
            valorOriginal: s.valorOriginal,
            possuiDesconto: s.possuiDesconto,
            valorComDesconto: s.valorComDesconto
        })) || []
    });
};
exports.listServices = listServices;
const addServices = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { serviceIds } = req.body;
    if (!serviceIds || !Array.isArray(serviceIds)) {
        throw new AppError_1.default("ERR_SERVICE_IDS_REQUIRED", 400);
    }
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    // Verificar se serviços existem
    const services = await Servico_1.default.findAll({
        where: { id: { [sequelize_1.Op.in]: serviceIds }, companyId: externalAuth.companyId }
    });
    if (services.length === 0) {
        throw new AppError_1.default("ERR_SERVICES_NOT_FOUND", 404);
    }
    // Adicionar serviços ao usuário
    for (const service of services) {
        const existing = await UserService_1.default.findOne({
            where: { userId: user.id, serviceId: service.id }
        });
        if (!existing) {
            await UserService_1.default.create({
                userId: user.id,
                serviceId: service.id
            });
        }
    }
    await user.reload({
        include: [
            { model: Servico_1.default, as: "services", through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.services.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
        }
    });
    return res.json({
        message: "Serviços adicionados com sucesso",
        services: user.services?.map(s => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao,
            valorOriginal: s.valorOriginal,
            possuiDesconto: s.possuiDesconto,
            valorComDesconto: s.valorComDesconto
        })) || []
    });
};
exports.addServices = addServices;
const removeServices = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { serviceIds } = req.body;
    if (!serviceIds || !Array.isArray(serviceIds)) {
        throw new AppError_1.default("ERR_SERVICE_IDS_REQUIRED", 400);
    }
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    await UserService_1.default.destroy({
        where: { userId: user.id, serviceId: { [sequelize_1.Op.in]: serviceIds } }
    });
    await user.reload({
        include: [
            { model: Servico_1.default, as: "services", through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.services.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
        }
    });
    return res.json({
        message: "Serviços removidos com sucesso",
        services: user.services?.map(s => ({
            id: s.id,
            nome: s.nome
        })) || []
    });
};
exports.removeServices = removeServices;
const setServices = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { serviceIds } = req.body;
    if (!serviceIds || !Array.isArray(serviceIds)) {
        throw new AppError_1.default("ERR_SERVICE_IDS_REQUIRED", 400);
    }
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    // Remover todos os serviços atuais
    await UserService_1.default.destroy({ where: { userId: user.id } });
    // Adicionar novos serviços
    for (const serviceId of serviceIds) {
        const service = await Servico_1.default.findOne({
            where: { id: serviceId, companyId: externalAuth.companyId }
        });
        if (service) {
            await UserService_1.default.create({
                userId: user.id,
                serviceId: service.id
            });
        }
    }
    await user.reload({
        include: [
            { model: Servico_1.default, as: "services", through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.services.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            services: user.services?.map(s => ({ id: s.id, nome: s.nome }))
        }
    });
    return res.json({
        message: "Serviços atualizados com sucesso",
        services: user.services?.map(s => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao,
            valorOriginal: s.valorOriginal,
            possuiDesconto: s.possuiDesconto,
            valorComDesconto: s.valorComDesconto
        })) || []
    });
};
exports.setServices = setServices;
// ==================== AGENDA DO USUÁRIO ====================
const getSchedule = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId }
    });
    if (!schedule) {
        return res.json({
            schedule: null,
            message: "Usuário não possui agenda configurada"
        });
    }
    return res.json({
        schedule: {
            id: schedule.id,
            name: schedule.name,
            description: schedule.description,
            active: schedule.active,
            userId: schedule.userId,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
        }
    });
};
exports.getSchedule = getSchedule;
const createSchedule = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, description, active } = req.body;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    // Verificar se já existe agenda
    const existingSchedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id }
    });
    if (existingSchedule) {
        throw new AppError_1.default("ERR_USER_SCHEDULE_ALREADY_EXISTS", 400);
    }
    const schedule = await UserSchedule_1.default.create({
        name: name || `Agenda de ${user.name}`,
        description: description || "",
        active: active !== false,
        userId: user.id,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.schedule.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            schedule: {
                id: schedule.id,
                name: schedule.name,
                active: schedule.active
            }
        }
    });
    return res.status(201).json({
        schedule: {
            id: schedule.id,
            name: schedule.name,
            description: schedule.description,
            active: schedule.active,
            userId: schedule.userId,
            createdAt: schedule.createdAt
        }
    });
};
exports.createSchedule = createSchedule;
const updateSchedule = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, description, active } = req.body;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId: externalAuth.companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("ERR_USER_SCHEDULE_NOT_FOUND", 404);
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (active !== undefined)
        updateData.active = active;
    await schedule.update(updateData);
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.schedule.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            schedule: {
                id: schedule.id,
                name: schedule.name,
                active: schedule.active
            }
        }
    });
    return res.json({
        schedule: {
            id: schedule.id,
            name: schedule.name,
            description: schedule.description,
            active: schedule.active,
            userId: schedule.userId,
            updatedAt: schedule.updatedAt
        }
    });
};
exports.updateSchedule = updateSchedule;
// ==================== COMPROMISSOS DO USUÁRIO ====================
const listAppointments = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const { status, startDate, endDate, pageNumber = "1" } = req.query;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId }
    });
    if (!schedule) {
        return res.json({
            appointments: [],
            count: 0,
            message: "Usuário não possui agenda configurada"
        });
    }
    const whereCondition = { scheduleId: schedule.id };
    if (status) {
        whereCondition.status = status;
    }
    if (startDate) {
        whereCondition.startDatetime = {
            ...whereCondition.startDatetime,
            [sequelize_1.Op.gte]: new Date(startDate)
        };
    }
    if (endDate) {
        whereCondition.startDatetime = {
            ...whereCondition.startDatetime,
            [sequelize_1.Op.lte]: new Date(endDate)
        };
    }
    const limit = 50;
    const offset = (Number(pageNumber) - 1) * limit;
    const { count, rows: appointments } = await Appointment_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            { model: Servico_1.default, as: "service", attributes: ["id", "nome", "valorOriginal"] },
            { model: CrmClient_1.default, as: "client", attributes: ["id", "name", "email", "phone"] },
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number"] }
        ],
        order: [["startDatetime", "ASC"]],
        limit,
        offset
    });
    return res.json({
        appointments: appointments.map(a => ({
            id: a.id,
            title: a.title,
            description: a.description,
            startDatetime: a.startDatetime,
            durationMinutes: a.durationMinutes,
            status: a.status,
            service: a.service ? { id: a.service.id, nome: a.service.nome, valor: a.service.valorOriginal } : null,
            client: a.client ? { id: a.client.id, name: a.client.name, email: a.client.email } : null,
            contact: a.contact ? { id: a.contact.id, name: a.contact.name, number: a.contact.number } : null,
            createdAt: a.createdAt
        })),
        count,
        hasMore: offset + appointments.length < count
    });
};
exports.listAppointments = listAppointments;
const createAppointment = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { title, description, startDatetime, durationMinutes, serviceId, clientId, contactId } = req.body;
    if (!startDatetime) {
        throw new AppError_1.default("ERR_START_DATETIME_REQUIRED", 400);
    }
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    let schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId: externalAuth.companyId }
    });
    // Criar agenda automaticamente se não existir
    if (!schedule) {
        schedule = await UserSchedule_1.default.create({
            name: `Agenda de ${user.name}`,
            description: "",
            active: true,
            userId: user.id,
            companyId: externalAuth.companyId
        });
    }
    const appointment = await Appointment_1.default.create({
        title: title || "Compromisso",
        description: description || "",
        startDatetime: new Date(startDatetime),
        durationMinutes: durationMinutes || 60,
        status: "scheduled",
        scheduleId: schedule.id,
        serviceId: serviceId || null,
        clientId: clientId || null,
        contactId: contactId || null,
        companyId: externalAuth.companyId
    });
    await appointment.reload({
        include: [
            { model: Servico_1.default, as: "service", attributes: ["id", "nome", "valorOriginal"] },
            { model: CrmClient_1.default, as: "client", attributes: ["id", "name", "email", "phone"] },
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number"] }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.appointment.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            appointment: {
                id: appointment.id,
                title: appointment.title,
                startDatetime: appointment.startDatetime,
                status: appointment.status
            }
        }
    });
    return res.status(201).json({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        startDatetime: appointment.startDatetime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        service: appointment.service ? { id: appointment.service.id, nome: appointment.service.nome } : null,
        client: appointment.client ? { id: appointment.client.id, name: appointment.client.name } : null,
        contact: appointment.contact ? { id: appointment.contact.id, name: appointment.contact.name } : null,
        createdAt: appointment.createdAt
    });
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id, appointmentId } = req.params;
    const { title, description, startDatetime, durationMinutes, status, serviceId, clientId, contactId } = req.body;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId: externalAuth.companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("ERR_USER_SCHEDULE_NOT_FOUND", 404);
    }
    const appointment = await Appointment_1.default.findOne({
        where: { id: Number(appointmentId), scheduleId: schedule.id }
    });
    if (!appointment) {
        throw new AppError_1.default("ERR_APPOINTMENT_NOT_FOUND", 404);
    }
    const updateData = {};
    if (title !== undefined)
        updateData.title = title;
    if (description !== undefined)
        updateData.description = description;
    if (startDatetime !== undefined)
        updateData.startDatetime = new Date(startDatetime);
    if (durationMinutes !== undefined)
        updateData.durationMinutes = durationMinutes;
    if (status !== undefined)
        updateData.status = status;
    if (serviceId !== undefined)
        updateData.serviceId = serviceId;
    if (clientId !== undefined)
        updateData.clientId = clientId;
    if (contactId !== undefined)
        updateData.contactId = contactId;
    await appointment.update(updateData);
    await appointment.reload({
        include: [
            { model: Servico_1.default, as: "service", attributes: ["id", "nome", "valorOriginal"] },
            { model: CrmClient_1.default, as: "client", attributes: ["id", "name", "email", "phone"] },
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "number"] }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.appointment.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            appointment: {
                id: appointment.id,
                title: appointment.title,
                startDatetime: appointment.startDatetime,
                status: appointment.status
            }
        }
    });
    return res.json({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        startDatetime: appointment.startDatetime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        service: appointment.service ? { id: appointment.service.id, nome: appointment.service.nome } : null,
        client: appointment.client ? { id: appointment.client.id, name: appointment.client.name } : null,
        contact: appointment.contact ? { id: appointment.contact.id, name: appointment.contact.name } : null,
        updatedAt: appointment.updatedAt
    });
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id, appointmentId } = req.params;
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId: externalAuth.companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("ERR_USER_SCHEDULE_NOT_FOUND", 404);
    }
    const appointment = await Appointment_1.default.findOne({
        where: { id: Number(appointmentId), scheduleId: schedule.id }
    });
    if (!appointment) {
        throw new AppError_1.default("ERR_APPOINTMENT_NOT_FOUND", 404);
    }
    await appointment.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "user.appointment.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            appointmentId: Number(appointmentId)
        }
    });
    return res.json({ message: "Compromisso removido com sucesso" });
};
exports.deleteAppointment = deleteAppointment;
const updateAppointmentStatus = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id, appointmentId } = req.params;
    const { status } = req.body;
    const validStatuses = ["scheduled", "confirmed", "completed", "cancelled", "no_show"];
    if (!status || !validStatuses.includes(status)) {
        throw new AppError_1.default("ERR_INVALID_STATUS", 400);
    }
    const user = await User_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!user) {
        throw new AppError_1.default("ERR_USER_NOT_FOUND", 404);
    }
    const schedule = await UserSchedule_1.default.findOne({
        where: { userId: user.id, companyId: externalAuth.companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("ERR_USER_SCHEDULE_NOT_FOUND", 404);
    }
    const appointment = await Appointment_1.default.findOne({
        where: { id: Number(appointmentId), scheduleId: schedule.id }
    });
    if (!appointment) {
        throw new AppError_1.default("ERR_APPOINTMENT_NOT_FOUND", 404);
    }
    await appointment.update({ status });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: `user.appointment.${status}`,
        data: {
            apiKeyId: externalAuth.apiKeyId,
            userId: user.id,
            appointmentId: appointment.id,
            status
        }
    });
    return res.json({
        id: appointment.id,
        title: appointment.title,
        status: appointment.status,
        message: `Status atualizado para ${status}`
    });
};
exports.updateAppointmentStatus = updateAppointmentStatus;
