"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Company_1 = __importDefault(require("../../models/Company"));
const Plan_1 = __importDefault(require("../../models/Plan"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const User_1 = __importDefault(require("../../models/User"));
const FindAllCompanyService = async () => {
    const companies = await Company_1.default.findAll({
        order: [["name", "ASC"]],
        include: [
            { model: Plan_1.default, as: "plan", attributes: ["id", "name", "amount"] },
            { model: Setting_1.default, as: "settings" },
            {
                model: User_1.default,
                as: "users",
                attributes: ["id", "name", "email", "profile"],
                where: { profile: "admin" },
                required: false
            }
        ]
    });
    return companies;
};
exports.default = FindAllCompanyService;
