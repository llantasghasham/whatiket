"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("../../models/Tag"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const KanbanListService = async ({ companyId }) => {
    const tags = await Tag_1.default.findAll({
        where: {
            kanban: 1,
            companyId: companyId,
        },
        include: [
            {
                model: Contact_1.default,
                as: "contacts",
                attributes: ["id", "name"],
                through: { attributes: [] }
            }
        ],
        order: [["id", "ASC"]],
    });
    //console.log(tags);
    return tags;
};
exports.default = KanbanListService;
