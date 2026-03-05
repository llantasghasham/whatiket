"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateTokens_1 = require("../../helpers/CreateTokens");
const Queue_1 = __importDefault(require("../../models/Queue"));
const Company_1 = __importDefault(require("../../models/Company"));
const ExternalAuthService = async ({ email, password }) => {
    const user = await User_1.default.findOne({
        where: { email },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color"]
            },
            {
                model: Company_1.default,
                as: "company",
                attributes: ["id", "name", "status"]
            }
        ]
    });
    if (!user) {
        throw new AppError_1.default("ERR_INVALID_CREDENTIALS", 401);
    }
    // Verificar se a empresa está ativa
    if (user.company && user.company.status === false) {
        throw new AppError_1.default("ERR_COMPANY_INACTIVE", 401);
    }
    // Verificar senha
    if (!(await user.checkPassword(password))) {
        throw new AppError_1.default("ERR_INVALID_CREDENTIALS", 401);
    }
    // Atualizar último login da empresa
    if (user.company) {
        await user.company.update({ lastLogin: new Date() });
    }
    // Atualizar status online do usuário
    await user.update({ online: true });
    const token = (0, CreateTokens_1.createAccessToken)(user);
    const refreshToken = (0, CreateTokens_1.createRefreshToken)(user);
    // Token expira em 15 minutos (900 segundos) - padrão do sistema
    const expiresIn = 900;
    const serializedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        companyId: user.companyId,
        queues: user.queues?.map(queue => ({
            id: queue.id,
            name: queue.name,
            color: queue.color
        })) || []
    };
    return {
        user: serializedUser,
        token,
        refreshToken,
        expiresIn
    };
};
exports.default = ExternalAuthService;
