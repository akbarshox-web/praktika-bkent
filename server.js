import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

// Routes
import authRoutes from './src/routes/auth.js';
import courseRoutes from './src/routes/course.js';
import { protect } from './src/middleware/authMiddleware.js';

const app = express();

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Middleware ---
app.use(helmet());

// .env dan domenlar ro'yxatini olamiz va massivga aylantiramiz
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];

app.use(cors({
    origin: function (origin, callback) {
        // origin bo'sh bo'lsa (masalan, Postman orqali) yoki ro'yxatda bo'lsa ruxsat beramiz
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS xatoligi: Ushbu domendan ruxsat yo\'q!'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Protected profile endpoint
app.get('/api/profile', protect, (req, res) => {
    res.json({ message: "Sizning profilingiz", user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', site: 'praktika' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}-portda ishlamoqda`));
