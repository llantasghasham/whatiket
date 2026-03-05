"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../models/Contact"));
const CreateOrUpdateContactService_1 = __importDefault(require("../../services/ContactServices/CreateOrUpdateContactService"));
const FindOrCreateContactService = async (contact) => {
    const { name, picture, from, connection, firstName, lastName } = contact;
    const existingContact = await Contact_1.default.findOne({
        where: {
            number: from,
            companyId: connection.companyId
        }
    });
    if (existingContact) {
        return existingContact;
    }
    const normalizedName = name || firstName || lastName || from;
    return (0, CreateOrUpdateContactService_1.default)({
        name: normalizedName,
        number: from,
        profilePicUrl: picture,
        isGroup: false,
        channel: connection.channel,
        companyId: connection.companyId,
        remoteJid: `${from}@s.whatsapp.net`,
        whatsappId: connection.id
    });
};
exports.default = FindOrCreateContactService;
