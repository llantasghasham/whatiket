"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduleFollowUpService_1 = __importDefault(require("../FollowUpService/ScheduleFollowUpService"));
const FollowUp_1 = __importDefault(require("../../models/FollowUp"));
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
class FollowUpNodeService {
    constructor() {
        this.scheduleService = new ScheduleFollowUpService_1.default();
    }
    async executeFollowUpNode(nodeData, ticketId, companyId, flowNodeId) {
        try {
            const followUp = await this.scheduleService.scheduleFollowUp({
                delayMinutes: nodeData.delayMinutes,
                action: nodeData.action,
                ticketId,
                companyId,
                flowNodeId
            });
            console.log(`Follow-up node scheduled: ${followUp.id} for ticket ${ticketId}`);
        }
        catch (error) {
            console.error("Error executing follow-up node:", error);
            throw error;
        }
    }
    async cancelTicketFollowUps(ticketId, companyId) {
        try {
            await this.scheduleService.resetFollowUpVariables(ticketId, companyId);
            console.log(`Cancelled all follow-ups for ticket ${ticketId}`);
        }
        catch (error) {
            console.error("Error cancelling follow-ups:", error);
            throw error;
        }
    }
    async getTicketFollowUps(ticketId, companyId) {
        try {
            return await this.scheduleService.getFollowUpsByTicket(ticketId, companyId);
        }
        catch (error) {
            console.error("Error getting follow-ups:", error);
            throw error;
        }
    }
    async hasPendingFollowUp(ticketId, companyId) {
        try {
            const now = (0, moment_1.default)().toDate();
            const pendingFollowUp = await FollowUp_1.default.findOne({
                where: {
                    ticketId,
                    companyId,
                    status: 'pending',
                    scheduledAt: {
                        [sequelize_1.Op.gte]: now
                    }
                }
            });
            return !!pendingFollowUp;
        }
        catch (error) {
            console.error("Error checking pending follow-up:", error);
            return false;
        }
    }
}
exports.default = new FollowUpNodeService();
