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
const User_1 = __importDefault(require("./User"));
const Appointment_1 = __importDefault(require("./Appointment"));
const UserGoogleCalendarIntegration_1 = __importDefault(require("./UserGoogleCalendarIntegration"));
let UserSchedule = class UserSchedule extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], UserSchedule.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], UserSchedule.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], UserSchedule.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], UserSchedule.prototype, "active", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    (0, sequelize_typescript_1.Column)({ field: "user_id" }),
    __metadata("design:type", Number)
], UserSchedule.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default),
    __metadata("design:type", User_1.default)
], UserSchedule.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], UserSchedule.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], UserSchedule.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Appointment_1.default),
    __metadata("design:type", Array)
], UserSchedule.prototype, "appointments", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => UserGoogleCalendarIntegration_1.default),
    (0, sequelize_typescript_1.Column)({ field: "user_google_calendar_integration_id", allowNull: true }),
    __metadata("design:type", Number)
], UserSchedule.prototype, "userGoogleCalendarIntegrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => UserGoogleCalendarIntegration_1.default),
    __metadata("design:type", UserGoogleCalendarIntegration_1.default)
], UserSchedule.prototype, "googleCalendarIntegration", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], UserSchedule.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], UserSchedule.prototype, "updatedAt", void 0);
UserSchedule = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "user_schedules" })
], UserSchedule);
exports.default = UserSchedule;
