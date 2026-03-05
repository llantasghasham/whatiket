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
const UserSchedule_1 = __importDefault(require("./UserSchedule"));
const Servico_1 = __importDefault(require("./Servico"));
const CrmClient_1 = __importDefault(require("./CrmClient"));
const Contact_1 = __importDefault(require("./Contact"));
let Appointment = class Appointment extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], Appointment.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Appointment.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "start_datetime", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], Appointment.prototype, "startDatetime", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(60),
    (0, sequelize_typescript_1.Column)({ field: "duration_minutes" }),
    __metadata("design:type", Number)
], Appointment.prototype, "durationMinutes", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("scheduled"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "google_event_id", allowNull: true }),
    __metadata("design:type", String)
], Appointment.prototype, "googleEventId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => UserSchedule_1.default),
    (0, sequelize_typescript_1.Column)({ field: "schedule_id" }),
    __metadata("design:type", Number)
], Appointment.prototype, "scheduleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => UserSchedule_1.default),
    __metadata("design:type", UserSchedule_1.default)
], Appointment.prototype, "schedule", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Servico_1.default),
    (0, sequelize_typescript_1.Column)({ field: "service_id" }),
    __metadata("design:type", Number)
], Appointment.prototype, "serviceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Servico_1.default),
    __metadata("design:type", Servico_1.default)
], Appointment.prototype, "service", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CrmClient_1.default),
    (0, sequelize_typescript_1.Column)({ field: "client_id" }),
    __metadata("design:type", Number)
], Appointment.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CrmClient_1.default),
    __metadata("design:type", CrmClient_1.default)
], Appointment.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    (0, sequelize_typescript_1.Column)({ field: "contact_id" }),
    __metadata("design:type", Number)
], Appointment.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], Appointment.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], Appointment.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Appointment.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
Appointment = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "appointments" })
], Appointment);
exports.default = Appointment;
