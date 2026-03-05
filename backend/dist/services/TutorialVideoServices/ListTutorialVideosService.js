"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const TutorialVideo_1 = __importDefault(require("../../models/TutorialVideo"));
const User_1 = __importDefault(require("../../models/User"));
const Company_1 = __importDefault(require("../../models/Company"));
const ListTutorialVideosService = async ({ companyId, searchParam = "", pageNumber = "1", isActive = true }) => {
    const whereCondition = {
        companyId
    };
    if (isActive !== undefined) {
        whereCondition.isActive = isActive;
    }
    if (searchParam) {
        whereCondition[sequelize_1.Op.or] = [
            {
                title: {
                    [sequelize_1.Op.iLike]: `%${searchParam}%`
                }
            },
            {
                description: {
                    [sequelize_1.Op.iLike]: `%${searchParam}%`
                }
            }
        ];
    }
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: tutorialVideos } = await TutorialVideo_1.default.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name", "email"]
            },
            {
                model: Company_1.default,
                as: "company",
                attributes: ["id", "name"]
            }
        ]
    });
    const hasMore = count > offset + tutorialVideos.length;
    return {
        tutorialVideos,
        count,
        hasMore
    };
};
exports.default = ListTutorialVideosService;
