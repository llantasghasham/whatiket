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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
// import User from "./User";
// import Company from "./Company";
let UserGoogleCalendarIntegration = class UserGoogleCalendarIntegration extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], UserGoogleCalendarIntegration.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "user_id" }),
    __metadata("design:type", Number)
], UserGoogleCalendarIntegration.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], UserGoogleCalendarIntegration.prototype, "companyId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "googleUserId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "accessToken", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "refreshToken", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], UserGoogleCalendarIntegration.prototype, "expiryDate", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "calendarId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], UserGoogleCalendarIntegration.prototype, "active", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], UserGoogleCalendarIntegration.prototype, "syncToken", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], UserGoogleCalendarIntegration.prototype, "lastSyncAt", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], UserGoogleCalendarIntegration.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], UserGoogleCalendarIntegration.prototype, "updatedAt", void 0);
UserGoogleCalendarIntegration = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "UserGoogleCalendarIntegrations",
        name: {
            singular: "UserGoogleCalendarIntegration",
            plural: "UserGoogleCalendarIntegrations"
        }
    })
], UserGoogleCalendarIntegration);
exports.default = UserGoogleCalendarIntegration;
