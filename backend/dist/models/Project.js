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
const CrmClient_1 = __importDefault(require("./CrmClient"));
const Invoices_1 = __importDefault(require("./Invoices"));
const ProjectService_1 = __importDefault(require("./ProjectService"));
const ProjectProduct_1 = __importDefault(require("./ProjectProduct"));
const ProjectUser_1 = __importDefault(require("./ProjectUser"));
const ProjectTask_1 = __importDefault(require("./ProjectTask"));
let Project = class Project extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Project.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Project.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Project.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CrmClient_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Project.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CrmClient_1.default),
    __metadata("design:type", CrmClient_1.default)
], Project.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Invoices_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Project.prototype, "invoiceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Invoices_1.default),
    __metadata("design:type", Invoices_1.default)
], Project.prototype, "invoice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Project.prototype, "deliveryTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Project.prototype, "warranty", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Project.prototype, "terms", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("draft"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(30)),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Project.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Project.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProjectService_1.default),
    __metadata("design:type", Array)
], Project.prototype, "services", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProjectProduct_1.default),
    __metadata("design:type", Array)
], Project.prototype, "products", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProjectUser_1.default),
    __metadata("design:type", Array)
], Project.prototype, "users", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProjectTask_1.default),
    __metadata("design:type", Array)
], Project.prototype, "tasks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
Project = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "projects"
    })
], Project);
exports.default = Project;
