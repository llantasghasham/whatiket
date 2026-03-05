"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("../../models/Tag"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const TagService = async (id, companyId) => {
    const whereCondition = { id };
    if (companyId) {
        whereCondition.companyId = companyId;
    }
    const tag = await Tag_1.default.findOne({
        where: whereCondition,
        include: ["contacts"]
    });
    if (!tag) {
        throw new AppError_1.default("ERR_NO_TAG_FOUND", 404);
    }
    return tag;
};
exports.default = TagService;
