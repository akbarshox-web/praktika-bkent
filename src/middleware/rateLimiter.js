import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 daqiqa
    max: 5, // 5 ta so'rov
    message: { message: "Huda ko'p urinish, iltimos 1 daqiqa kuting." }
});