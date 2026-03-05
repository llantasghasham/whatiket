"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrmClient_1 = __importDefault(require("../../../models/CrmClient"));
const CrmClientContact_1 = __importDefault(require("../../../models/CrmClientContact"));
const findClientByContact = async (contactId, companyId) => {
    if (!contactId) {
        return null;
    }
    let client = await CrmClient_1.default.findOne({
        where: {
            companyId,
            contactId
        }
    });
    if (client) {
        return client;
    }
    const pivot = await CrmClientContact_1.default.findOne({
        where: { contactId },
        order: [["created_at", "DESC"]]
    });
    if (pivot) {
        client = await CrmClient_1.default.findOne({
            where: {
                companyId,
                id: pivot.clientId
            }
        });
    }
    return client;
};
exports.default = findClientByContact;
