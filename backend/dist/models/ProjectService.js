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
const Project_1 = __importDefault(require("./Project"));
const Servico_1 = __importDefault(require("./Servico"));
let ProjectService = class ProjectService extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProjectService.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProjectService.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], ProjectService.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Project_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProjectService.prototype, "projectId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Project_1.default),
    __metadata("design:type", Project_1.default)
], ProjectService.prototype, "project", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Servico_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProjectService.prototype, "serviceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Servico_1.default),
    __metadata("design:type", Servico_1.default)
], ProjectService.prototype, "service", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], ProjectService.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(12, 2)),
    __metadata("design:type", Number)
], ProjectService.prototype, "unitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], ProjectService.prototype, "notes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ProjectService.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ProjectService.prototype, "updatedAt", void 0);
ProjectService = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "project_services"
    })
], ProjectService);
exports.default = ProjectService;
