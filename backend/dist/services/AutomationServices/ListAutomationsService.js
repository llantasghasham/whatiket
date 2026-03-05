"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const ListAutomationsService = async (data) => {
    const { companyId, searchParam, triggerType, isActive, pageNumber = "1" } = data;
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const whereCondition = { companyId };
    if (searchParam) {
        whereCondition[sequelize_1.Op.or] = [
            { name: { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
            { description: { [sequelize_1.Op.iLike]: `%${searchParam}%` } }
        ];
    }
    if (triggerType) {
        whereCondition.triggerType = triggerType;
    }
    if (isActive !== undefined) {
        whereCondition.isActive = isActive;
    }
    const { count, rows: automations } = await Automation_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: AutomationAction_1.default,
                as: "actions",
                separate: true,
                order: [["order", "ASC"]]
            }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });
    const hasMore = count > offset + automations.length;
    return {
        automations,
        count,
        hasMore
    };
};
exports.default = ListAutomationsService;
