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
const CrmClientContact_1 = __importDefault(require("./CrmClientContact"));
const CrmLead_1 = __importDefault(require("./CrmLead"));
let CrmClient = class CrmClient extends sequelize_typescript_1.Model {
    static async syncToLead(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: syncClientToLead } = await Promise.resolve().then(() => __importStar(require("../services/CrmClientService/helpers/syncClientToLead")));
        try {
            await syncClientToLead({
                client: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[CrmClient Model] Error syncing to Lead:", error);
        }
    }
    static async handleCascadeDelete(instance) {
        // Import dinâmico para evitar circular dependency
        const { default: handleClientDeleteCascade } = await Promise.resolve().then(() => __importStar(require("../services/CrmClientService/handleClientDeleteCascade")));
        try {
            await handleClientDeleteCascade({
                client: instance,
                companyId: instance.companyId
            });
        }
        catch (error) {
            console.error("[CrmClient Model] Error handling cascade delete:", error);
        }
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CrmClient.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], CrmClient.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], CrmClient.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("pf"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "company_name", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CrmClient.prototype, "companyName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "document", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "birth_date", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], CrmClient.prototype, "birthDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "zip_code", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CrmClient.prototype, "zipCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "complement", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "neighborhood", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "asaas_customer_id", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CrmClient.prototype, "asaasCustomerId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("active"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CrmClient.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "client_since", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], CrmClient.prototype, "clientSince", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    (0, sequelize_typescript_1.Column)({ field: "owner_user_id" }),
    __metadata("design:type", Number)
], CrmClient.prototype, "ownerUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default, "ownerUserId"),
    __metadata("design:type", User_1.default)
], CrmClient.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], CrmClient.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    (0, sequelize_typescript_1.Column)({ field: "contact_id" }),
    __metadata("design:type", Number)
], CrmClient.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], CrmClient.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ticket_1.default),
    (0, sequelize_typescript_1.Column)({ field: "primary_ticket_id" }),
    __metadata("design:type", Number)
], CrmClient.prototype, "primaryTicketId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ticket_1.default, "primaryTicketId"),
    __metadata("design:type", Ticket_1.default)
], CrmClient.prototype, "primaryTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Ticket_1.default),
    __metadata("design:type", Array)
], CrmClient.prototype, "tickets", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CrmLead_1.default, "convertedClientId"),
    __metadata("design:type", Array)
], CrmClient.prototype, "leads", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CrmClientContact_1.default),
    __metadata("design:type", Array)
], CrmClient.prototype, "clientContacts", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Contact_1.default, () => CrmClientContact_1.default, "clientId", "contactId"),
    __metadata("design:type", Array)
], CrmClient.prototype, "contacts", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], CrmClient.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], CrmClient.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.AfterUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrmClient]),
    __metadata("design:returntype", Promise)
], CrmClient, "syncToLead", null);
__decorate([
    sequelize_typescript_1.BeforeDestroy,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrmClient]),
    __metadata("design:returntype", Promise)
], CrmClient, "handleCascadeDelete", null);
CrmClient = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "crm_clients"
    })
], CrmClient);
exports.default = CrmClient;
