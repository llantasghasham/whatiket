"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const PromptToolSetting_1 = __importDefault(require("../../models/PromptToolSetting"));
const ListPromptsService = async ({ searchParam = "", pageNumber = "1", companyId }) => {
    let whereCondition = {};
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    if (searchParam) {
        whereCondition = {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.like]: `%${searchParam}%` } }
            ]
        };
    }
    const { count, rows: prompts } = await Prompt_1.default.findAndCountAll({
        where: { ...whereCondition, companyId },
        include: [
            {
                model: Queue_1.default,
                as: "queue",
                attributes: ["id", "name"]
            },
            {
                model: PromptToolSetting_1.default,
                as: "toolSettings"
            }
        ],
        limit,
        offset,
        order: [["name", "ASC"]],
    });
    prompts.forEach(prompt => {
        const toolsEnabled = prompt.toolSettings
            ?.filter((tool) => tool?.enabled)
            .map((tool) => tool.toolName) || [];
        prompt.setDataValue("toolsEnabled", toolsEnabled);
    });
    const hasMore = count > offset + prompts.length;
    return {
        prompts,
        count,
        hasMore
    };
};
exports.default = ListPromptsService;
