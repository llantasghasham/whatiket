"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const CrmClient_1 = __importDefault(require("./CrmClient"));
const Contact_1 = __importDefault(require("./Contact"));
let CrmClientContact = class CrmClientContact extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CrmClientContact.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CrmClient_1.default),
    (0, sequelize_typescript_1.Column)({ field: "client_id" }),
    __metadata("design:type", Number)
], CrmClientContact.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CrmClient_1.default),
    __metadata("design:type", CrmClient_1.default)
], CrmClientContact.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    (0, sequelize_typescript_1.Column)({ field: "contact_id" }),
    __metadata("design:type", Number)
], CrmClientContact.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], CrmClientContact.prototype, "contact", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CrmClientContact.prototype, "role", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], CrmClientContact.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], CrmClientContact.prototype, "updatedAt", void 0);
CrmClientContact = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "crm_client_contacts"
    })
], CrmClientContact);
exports.default = CrmClientContact;
