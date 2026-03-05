"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDispatchQueue = exports.addDispatchJob = exports.getDispatchQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const dispatchQueue_1 = require("../config/dispatchQueue");
const logger_1 = __importDefault(require("../utils/logger"));
let dispatchQueueInstance = null;
const getDispatchQueue = () => {
    if (!dispatchQueueInstance) {
        dispatchQueueInstance = new bull_1.default(dispatchQueue_1.DISPATCH_QUEUE_NAME, dispatchQueue_1.DISPATCH_QUEUE_REDIS_URI);
    }
    return dispatchQueueInstance;
};
exports.getDispatchQueue = getDispatchQueue;
const addDispatchJob = async (data, opts = {}) => {
    const queue = (0, exports.getDispatchQueue)();
    const { delayMs, ...jobData } = data;
    return queue.add(jobData, {
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: "fixed", delay: 5000 },
        delay: delayMs ?? 0,
        ...opts
    });
};
exports.addDispatchJob = addDispatchJob;
const processDispatchQueue = (handler) => {
    const queue = (0, exports.getDispatchQueue)();
    queue.process(dispatchQueue_1.DISPATCH_QUEUE_CONCURRENCY, async (job) => {
        try {
            await handler(job);
        }
        catch (err) {
            logger_1.default.error(`[DispatchQueue] Job ${job.id} failed: ${err.message}`);
            throw err;
        }
    });
    queue.on("completed", job => {
        logger_1.default.info(`[DispatchQueue] Job ${job.id} completed`);
    });
    queue.on("failed", (job, err) => {
        logger_1.default.error(`[DispatchQueue] Job ${job?.id} failed`, err);
    });
};
exports.processDispatchQueue = processDispatchQueue;
