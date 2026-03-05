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
const MediaFolder_1 = __importDefault(require("./MediaFolder"));
let MediaFile = class MediaFile extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], MediaFile.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => MediaFolder_1.default),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ field: "folder_id" }),
    __metadata("design:type", Number)
], MediaFile.prototype, "folderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => MediaFolder_1.default),
    __metadata("design:type", MediaFolder_1.default)
], MediaFile.prototype, "folder", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ field: "company_id" }),
    __metadata("design:type", Number)
], MediaFile.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], MediaFile.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ field: "original_name", type: sequelize_typescript_1.DataType.STRING(255) }),
    __metadata("design:type", String)
], MediaFile.prototype, "originalName", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)({ field: "custom_name", type: sequelize_typescript_1.DataType.STRING(255) }),
    __metadata("design:type", String)
], MediaFile.prototype, "customName", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ field: "mime_type", type: sequelize_typescript_1.DataType.STRING(128) }),
    __metadata("design:type", String)
], MediaFile.prototype, "mimeType", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], MediaFile.prototype, "size", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ field: "storage_path", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], MediaFile.prototype, "storagePath", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], MediaFile.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], MediaFile.prototype, "updatedAt", void 0);
MediaFile = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "media_files",
        underscored: true,
        timestamps: true
    })
], MediaFile);
exports.default = MediaFile;
