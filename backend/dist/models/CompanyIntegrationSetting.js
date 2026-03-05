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
const CompanyIntegrationFieldMap_1 = __importDefault(require("./CompanyIntegrationFieldMap"));
let CompanyIntegrationSetting = class CompanyIntegrationSetting extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], CompanyIntegrationSetting.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], CompanyIntegrationSetting.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], CompanyIntegrationSetting.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "provider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "base_url", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "baseUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "api_key", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "apiKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "api_secret", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "apiSecret", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "webhook_secret", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], CompanyIntegrationSetting.prototype, "webhookSecret", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Object)
], CompanyIntegrationSetting.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], CompanyIntegrationSetting.prototype, "active", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CompanyIntegrationFieldMap_1.default),
    __metadata("design:type", Array)
], CompanyIntegrationSetting.prototype, "fieldMaps", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], CompanyIntegrationSetting.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], CompanyIntegrationSetting.prototype, "updatedAt", void 0);
CompanyIntegrationSetting = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "company_integration_settings"
    })
], CompanyIntegrationSetting);
exports.default = CompanyIntegrationSetting;
