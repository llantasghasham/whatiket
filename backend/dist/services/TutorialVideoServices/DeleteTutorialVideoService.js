"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowTutorialVideoService_1 = __importDefault(require("./ShowTutorialVideoService"));
const DeleteTutorialVideoService = async ({ id, companyId, hardDelete = false }) => {
    const tutorialVideo = await (0, ShowTutorialVideoService_1.default)({
        id,
        companyId
    });
    if (hardDelete) {
        await tutorialVideo.destroy();
    }
    else {
        await tutorialVideo.update({
            isActive: false
        });
    }
};
exports.default = DeleteTutorialVideoService;
