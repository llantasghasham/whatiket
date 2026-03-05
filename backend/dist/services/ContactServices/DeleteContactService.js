"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Message_1 = __importDefault(require("../../models/Message"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const ContactCustomField_1 = __importDefault(require("../../models/ContactCustomField"));
const ContactWallet_1 = __importDefault(require("../../models/ContactWallet"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const CrmClientContact_1 = __importDefault(require("../../models/CrmClientContact"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const database_1 = __importDefault(require("../../database"));
const DeleteContactService = async (id) => {
    const contact = await Contact_1.default.findOne({
        where: { id }
    });
    if (!contact) {
        throw new AppError_1.default("ERR_NO_CONTACT_FOUND", 404);
    }
    // Iniciar transação para exclusão em cascata
    const transaction = await database_1.default.transaction();
    try {
        // 1. Apagar mensagens dos tickets do contato
        const tickets = await Ticket_1.default.findAll({
            where: { contactId: contact.id },
            transaction
        });
        for (const ticket of tickets) {
            await Message_1.default.destroy({
                where: { ticketId: ticket.id },
                transaction
            });
        }
        // 2. Apagar tickets do contato
        await Ticket_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 3. Apagar tags do contato
        await ContactTag_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 4. Apagar campos customizados do contato
        await ContactCustomField_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 5. Apagar wallets do contato
        await ContactWallet_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 6. Apagar leads vinculados ao contato
        await CrmLead_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 7. Apagar vínculos com clientes
        await CrmClientContact_1.default.destroy({
            where: { contactId: contact.id },
            transaction
        });
        // 8. Finalmente apagar o contato
        await contact.destroy({ transaction });
        // Commit da transação
        await transaction.commit();
    }
    catch (error) {
        // Rollback em caso de erro
        await transaction.rollback();
        console.error("Error deleting contact:", error);
        throw new AppError_1.default("ERR_DELETE_CONTACT", 500);
    }
};
exports.default = DeleteContactService;
