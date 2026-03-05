"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const CrmClientContact_1 = __importDefault(require("../../models/CrmClientContact"));
const database_1 = __importDefault(require("../../database"));
const DeleteCrmClientService = async ({ id, companyId }) => {
    const client = await CrmClient_1.default.findOne({
        where: { id, companyId }
    });
    if (!client) {
        throw new AppError_1.default("Cliente não encontrado.", 404);
    }
    const transaction = await database_1.default.transaction();
    try {
        const pivotContacts = await CrmClientContact_1.default.findAll({
            where: { clientId: client.id },
            transaction
        });
        const contactIds = Array.from(new Set([
            client.contactId,
            ...pivotContacts.map(pivot => pivot.contactId)
        ].filter(Boolean)));
        if (pivotContacts.length) {
            await CrmClientContact_1.default.destroy({
                where: { clientId: client.id },
                transaction
            });
        }
        await CrmLead_1.default.destroy({
            where: {
                companyId,
                [sequelize_1.Op.or]: [
                    { convertedClientId: client.id },
                    ...(contactIds.length ? [{ contactId: { [sequelize_1.Op.in]: contactIds } }] : [])
                ]
            },
            transaction
        });
        if (contactIds.length) {
            await Contact_1.default.destroy({
                where: {
                    companyId,
                    id: { [sequelize_1.Op.in]: contactIds }
                },
                transaction
            });
        }
        await client.destroy({ transaction });
        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.default = DeleteCrmClientService;
