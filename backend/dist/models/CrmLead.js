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
const Company_1 = __importDefault(require("./Company"));
const User_1 = __importDefault(require("./User"));
const Contact_1 = __importDefault(require("./Contact"));
const Ticket_1 = __importDefault(require("./Ticket"));
const CrmClient_1 = __importDefault(require("./CrmClient"));
let CrmLead = class CrmLead extends sequelize_typescript_1.Model {
    static async syncToContact(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: syncLeadToContact } = await Promise.resolve().then(() => __importStar(require("../services/CrmLeadService/helpers/syncLeadToContact")));
        try {
            await syncLeadToContact({
                lead: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[CrmLead Model] Error syncing to Contact:", error);
        }
    }
    static async syncToClient(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: syncLeadToClient } = await Promise.resolve().then(() => __importStar(require("../services/CrmClientService/helpers/syncLeadToClient")));
        try {
            await syncLeadToClient({
                lead: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[CrmLead Model] Error syncing to Client:", error);
        }
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CrmLead.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], CrmLead.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], CrmLead.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "phone", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "lid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "birth_date", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], CrmLead.prototype, "birthDate", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "document", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "company_name" }),
    __metadata("design:type", String)
], CrmLead.prototype, "companyName", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "position", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "source", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "campaign", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "medium", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("new"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CrmLead.prototype, "score", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmLead.prototype, "temperature", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    (0, sequelize_typescript_1.Column)({ field: "owner_user_id" }),
    __metadata("design:type", Number)
], CrmLead.prototype, "ownerUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default, "ownerUserId"),
    __metadata("design:type", User_1.default)
], CrmLead.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    (0, sequelize_typescript_1.Column)({ field: "contact_id" }),
    __metadata("design:type", Number)
], CrmLead.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], CrmLead.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ticket_1.default),
    (0, sequelize_typescript_1.Column)({ field: "primary_ticket_id" }),
    __metadata("design:type", Number)
], CrmLead.prototype, "primaryTicketId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ticket_1.default, "primaryTicketId"),
    __metadata("design:type", Ticket_1.default)
], CrmLead.prototype, "primaryTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CrmClient_1.default),
    (0, sequelize_typescript_1.Column)({ field: "converted_client_id" }),
    __metadata("design:type", Number)
], CrmLead.prototype, "convertedClientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CrmClient_1.default, "convertedClientId"),
    __metadata("design:type", CrmClient_1.default)
], CrmLead.prototype, "convertedClient", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "converted_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], CrmLead.prototype, "convertedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], CrmLead.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "last_activity_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], CrmLead.prototype, "lastActivityAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("novo"),
    (0, sequelize_typescript_1.Column)({ field: "lead_status" }),
    __metadata("design:type", String)
], CrmLead.prototype, "leadStatus", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], CrmLead.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], CrmLead.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.AfterUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrmLead]),
    __metadata("design:returntype", Promise)
], CrmLead, "syncToContact", null);
__decorate([
    sequelize_typescript_1.AfterUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrmLead]),
    __metadata("design:returntype", Promise)
], CrmLead, "syncToClient", null);
CrmLead = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "crm_leads"
    })
], CrmLead);
exports.default = CrmLead;
