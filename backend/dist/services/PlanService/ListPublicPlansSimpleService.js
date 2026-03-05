"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Plan_1 = __importDefault(require("../../models/Plan"));
const ListPublicPlansSimpleService = async () => {
    const plans = await Plan_1.default.findAll({
        where: { isPublic: true },
        attributes: [
            "id", "name", "amount", "users", "connections", "queues",
            "useWhatsapp", "useFacebook", "useInstagram", "useCampaigns",
            "useSchedules", "useInternalChat", "useExternalApi", "useKanban",
            "useOpenAi", "trial", "trialDays", "recurrence"
        ],
        order: [["name", "ASC"]]
    });
    return plans.map(plan => plan.get({ plain: true }));
};
exports.default = ListPublicPlansSimpleService;
