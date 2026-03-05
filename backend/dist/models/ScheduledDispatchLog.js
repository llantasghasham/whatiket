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
const ScheduledDispatcher_1 = __importDefault(require("./ScheduledDispatcher"));
const Contact_1 = __importDefault(require("./Contact"));
const Ticket_1 = __importDefault(require("./Ticket"));
const Company_1 = __importDefault(require("./Company"));
let ScheduledDispatchLog = class ScheduledDispatchLog extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ScheduledDispatchLog.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ScheduledDispatcher_1.default),
    (0, sequelize_typescript_1.Column)({ field: "dispatcher_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatchLog.prototype, "dispatcherId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ScheduledDispatcher_1.default),
    __metadata("design:type", ScheduledDispatcher_1.default)
], ScheduledDispatchLog.prototype, "dispatcher", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    (0, sequelize_typescript_1.Column)({ field: "contact_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatchLog.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], ScheduledDispatchLog.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ticket_1.default),
    (0, sequelize_typescript_1.Column)({ field: "ticket_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatchLog.prototype, "ticketId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ticket_1.default),
    __metadata("design:type", Ticket_1.default)
], ScheduledDispatchLog.prototype, "ticket", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ScheduledDispatchLog.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], ScheduledDispatchLog.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ScheduledDispatchLog.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "error_message", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], ScheduledDispatchLog.prototype, "errorMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "sent_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], ScheduledDispatchLog.prototype, "sentAt", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], ScheduledDispatchLog.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], ScheduledDispatchLog.prototype, "updatedAt", void 0);
ScheduledDispatchLog = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "scheduled_dispatch_logs"
    })
], ScheduledDispatchLog);
exports.default = ScheduledDispatchLog;
