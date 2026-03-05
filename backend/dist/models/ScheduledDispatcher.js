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
const Company_1 = __importDefault(require("./Company"));
const Whatsapp_1 = __importDefault(require("./Whatsapp"));
const ScheduledDispatchLog_1 = __importDefault(require("./ScheduledDispatchLog"));
let ScheduledDispatcher = class ScheduledDispatcher extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], ScheduledDispatcher.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ScheduledDispatcher.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "message_template", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], ScheduledDispatcher.prototype, "messageTemplate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "event_type", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], ScheduledDispatcher.prototype, "eventType", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Whatsapp_1.default),
    (0, sequelize_typescript_1.Column)({ field: "whatsapp_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "whatsappId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Whatsapp_1.default),
    __metadata("design:type", Whatsapp_1.default)
], ScheduledDispatcher.prototype, "whatsapp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "start_time", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], ScheduledDispatcher.prototype, "startTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "send_interval_seconds", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "sendIntervalSeconds", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "days_before_due", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "daysBeforeDue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "days_after_due", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatcher.prototype, "daysAfterDue", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], ScheduledDispatcher.prototype, "active", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ScheduledDispatchLog_1.default),
    __metadata("design:type", Array)
], ScheduledDispatcher.prototype, "logs", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], ScheduledDispatcher.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], ScheduledDispatcher.prototype, "updatedAt", void 0);
ScheduledDispatcher = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "scheduled_dispatchers"
    })
], ScheduledDispatcher);
exports.default = ScheduledDispatcher;
