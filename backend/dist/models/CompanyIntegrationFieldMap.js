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
const CompanyIntegrationSetting_1 = __importDefault(require("./CompanyIntegrationSetting"));
let CompanyIntegrationFieldMap = class CompanyIntegrationFieldMap extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], CompanyIntegrationFieldMap.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CompanyIntegrationSetting_1.default),
    (0, sequelize_typescript_1.Column)({ field: "integration_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], CompanyIntegrationFieldMap.prototype, "integrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CompanyIntegrationSetting_1.default),
    __metadata("design:type", CompanyIntegrationSetting_1.default)
], CompanyIntegrationFieldMap.prototype, "integration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "external_field", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CompanyIntegrationFieldMap.prototype, "externalField", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "crm_field", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CompanyIntegrationFieldMap.prototype, "crmField", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "transform_expression", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], CompanyIntegrationFieldMap.prototype, "transformExpression", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Object)
], CompanyIntegrationFieldMap.prototype, "options", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], CompanyIntegrationFieldMap.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], CompanyIntegrationFieldMap.prototype, "updatedAt", void 0);
CompanyIntegrationFieldMap = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "company_integration_field_maps"
    })
], CompanyIntegrationFieldMap);
exports.default = CompanyIntegrationFieldMap;
