"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_typescript_2 = require("sequelize-typescript");
const ContactCustomField_1 = __importDefault(require("./ContactCustomField"));
const Ticket_1 = __importDefault(require("./Ticket"));
const Company_1 = __importDefault(require("./Company"));
const Schedule_1 = __importDefault(require("./Schedule"));
const ContactTag_1 = __importDefault(require("./ContactTag"));
const Tag_1 = __importDefault(require("./Tag"));
const ContactWallet_1 = __importDefault(require("./ContactWallet"));
const User_1 = __importDefault(require("./User"));
const Whatsapp_1 = __importDefault(require("./Whatsapp"));
const CrmClient_1 = __importDefault(require("./CrmClient"));
const CrmClientContact_1 = __importDefault(require("./CrmClientContact"));
let Contact = class Contact extends sequelize_typescript_1.Model {
    get urlPicture() {
        if (this.getDataValue("urlPicture")) {
            return this.getDataValue("urlPicture") === 'nopicture.png' ? `${process.env.FRONTEND_URL}/nopicture.png` :
                `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}/public/company${this.companyId}/contacts/${this.getDataValue("urlPicture")}`;
        }
        return null;
    }
    // Hooks para debug do campo LID
    static logBeforeCreate(instance) {
        console.log("[Contact Model] BeforeCreate:", {
            name: instance.name,
            number: instance.number,
            lid: instance.lid,
            remoteJid: instance.remoteJid,
            isLid: instance.isLid
        });
    }
    static logAfterCreate(instance) {
        console.log("[Contact Model] AfterCreate - Contact created with ID:", instance.id, {
            name: instance.name,
            number: instance.number,
            lid: instance.lid,
            remoteJid: instance.remoteJid,
            isLid: instance.isLid
        });
    }
    static async relinkToExistingRecords(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: relinkContactToExistingRecords } = await Promise.resolve().then(() => __importStar(require("../services/ContactServices/relinkContactToExistingRecords")));
        try {
            await relinkContactToExistingRecords({
                contact: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[Contact Model] Error relinking to existing records:", error);
        }
    }
    static logBeforeUpdate(instance) {
        console.log("[Contact Model] BeforeUpdate - Contact ID:", instance.id, {
            name: instance.name,
            number: instance.number,
            lid: instance.lid,
            remoteJid: instance.remoteJid,
            isLid: instance.isLid,
            changed: instance.changed()
        });
    }
    static logAfterUpdate(instance) {
        console.log("[Contact Model] AfterUpdate - Contact ID:", instance.id, {
            name: instance.name,
            number: instance.number,
            lid: instance.lid,
            remoteJid: instance.remoteJid,
            isLid: instance.isLid
        });
    }
    static async syncToLead(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: syncContactToLead } = await Promise.resolve().then(() => __importStar(require("../services/CrmLeadService/helpers/syncContactToLead")));
        try {
            await syncContactToLead({
                contact: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[Contact Model] Error syncing to Lead:", error);
        }
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Unique)("contacts_company_number_unique"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(""),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "profilePicUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "isGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "disableBot", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "acceptAudioMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "active", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("whatsapp"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "channel", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_2.DataType.JSONB),
    __metadata("design:type", Object)
], Contact.prototype, "files", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "cpfCnpj", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "address", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "info", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Contact.prototype, "birthday", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Contact.prototype, "anniversary", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Contact.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Contact.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Ticket_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "tickets", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ContactCustomField_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "extraInfo", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ContactTag_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "contactTags", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Tag_1.default, () => ContactTag_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "tags", void 0);
__decorate([
    (0, sequelize_typescript_1.Unique)("contacts_company_number_unique"),
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Contact.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Schedule_1.default, {
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        hooks: true
    }),
    __metadata("design:type", Array)
], Contact.prototype, "schedules", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "remoteJid", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "lid", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "isLid", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "savedToPhone", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Contact.prototype, "savedToPhoneAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "savedToPhoneReason", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "potentialScore", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "isPotential", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("unknown"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Contact.prototype, "lidStability", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Contact.prototype, "lgpdAcceptedAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Contact.prototype, "pictureUpdated", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Contact.prototype, "urlPicture", null);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => User_1.default, () => ContactWallet_1.default, "contactId", "walletId"),
    __metadata("design:type", Array)
], Contact.prototype, "wallets", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ContactWallet_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "contactWallets", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => CrmClient_1.default, () => CrmClientContact_1.default, "contactId", "clientId"),
    __metadata("design:type", Array)
], Contact.prototype, "crmClients", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CrmClientContact_1.default),
    __metadata("design:type", Array)
], Contact.prototype, "clientContacts", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Whatsapp_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "whatsappId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Whatsapp_1.default),
    __metadata("design:type", Whatsapp_1.default)
], Contact.prototype, "whatsapp", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", void 0)
], Contact, "logBeforeCreate", null);
__decorate([
    sequelize_typescript_1.AfterCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", void 0)
], Contact, "logAfterCreate", null);
__decorate([
    sequelize_typescript_1.AfterCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", Promise)
], Contact, "relinkToExistingRecords", null);
__decorate([
    sequelize_typescript_1.BeforeUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", void 0)
], Contact, "logBeforeUpdate", null);
__decorate([
    sequelize_typescript_1.AfterUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", void 0)
], Contact, "logAfterUpdate", null);
__decorate([
    sequelize_typescript_1.AfterUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact]),
    __metadata("design:returntype", Promise)
], Contact, "syncToLead", null);
Contact = __decorate([
    sequelize_typescript_1.Table
], Contact);
exports.default = Contact;
