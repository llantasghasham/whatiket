"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISPATCH_QUEUE_CONCURRENCY = exports.DISPATCH_QUEUE_NAME = exports.DISPATCH_QUEUE_REDIS_URI = void 0;
exports.DISPATCH_QUEUE_REDIS_URI = process.env.DISPATCH_QUEUE_REDIS_URI || process.env.REDIS_URI || "";
exports.DISPATCH_QUEUE_NAME = process.env.DISPATCH_QUEUE_NAME || "ScheduledDispatchQueue";
exports.DISPATCH_QUEUE_CONCURRENCY = Number(process.env.DISPATCH_QUEUE_CONCURRENCY || 1);
