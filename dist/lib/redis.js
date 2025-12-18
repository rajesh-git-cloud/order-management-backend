"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
if (process.env.REDIS_DISABLE === 'true') {
    //console.log('Redis is disabled for development/testing.');
}
else {
    try {
        redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
        redis.on('error', (err) => {
            console.warn('Redis connection failed, caching disabled.', err.message);
        });
    }
    catch (e) {
        console.warn('Redis not initialized, caching disabled.');
    }
}
exports.default = redis;
