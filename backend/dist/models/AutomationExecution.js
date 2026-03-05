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
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("./Contact"));
const Ticket_1 = __importDefault(require("./Ticket"));
let AutomationExecution = class AutomationExecution extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => require("./Automation").default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "automationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => require("./Automation").default),
    __metadata("design:type", Object)
], AutomationExecution.prototype, "automation", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => require("./AutomationAction").default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "automationActionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => require("./AutomationAction").default),
    __metadata("design:type", Object)
], AutomationExecution.prototype, "automationAction", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], AutomationExecution.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ticket_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "ticketId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ticket_1.default),
    __metadata("design:type", Ticket_1.default)
], AutomationExecution.prototype, "ticket", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], AutomationExecution.prototype, "scheduledAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("scheduled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], AutomationExecution.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AutomationExecution.prototype, "attempts", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], AutomationExecution.prototype, "lastAttemptAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], AutomationExecution.prototype, "completedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.TEXT),
    __metadata("design:type", String)
], AutomationExecution.prototype, "error", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.JSONB),
    __metadata("design:type", Object)
], AutomationExecution.prototype, "metadata", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], AutomationExecution.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], AutomationExecution.prototype, "updatedAt", void 0);
AutomationExecution = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "AutomationExecutions" })
], AutomationExecution);
exports.default = AutomationExecution;
