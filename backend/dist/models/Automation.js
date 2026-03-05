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
const Company_1 = __importDefault(require("./Company"));
const AutomationAction_1 = __importDefault(require("./AutomationAction"));
const AutomationLog_1 = __importDefault(require("./AutomationLog"));
const AutomationExecution_1 = __importDefault(require("./AutomationExecution"));
let Automation = class Automation extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Automation.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Automation.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Automation.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Automation.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.TEXT),
    __metadata("design:type", String)
], Automation.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Automation.prototype, "triggerType", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.JSONB),
    __metadata("design:type", Object)
], Automation.prototype, "triggerConfig", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Automation.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AutomationAction_1.default),
    __metadata("design:type", Array)
], Automation.prototype, "actions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AutomationLog_1.default),
    __metadata("design:type", Array)
], Automation.prototype, "logs", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AutomationExecution_1.default),
    __metadata("design:type", Array)
], Automation.prototype, "executions", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Automation.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Automation.prototype, "updatedAt", void 0);
Automation = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "Automations" })
], Automation);
exports.default = Automation;
