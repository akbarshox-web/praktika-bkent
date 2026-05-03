import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService.js';

// Vaqtinchalik ma'lumotlarni saqlash (Baza ishlatilsa isVerified: false qilib saqlash ma'qul)
export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        
        // Agar foydalanuvchi bor bo'lsa va tasdiqlangan bo'lsa
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Bu email bilan allaqachon ro'yxatdan o'tilgan" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser) {
            // Agar bor bo'lsa lekin tasdiqlanmagan bo'lsa, ma'lumotlarini yangilaymiz
            existingUser.password = hashedPassword;
            existingUser.verificationCode = code;
            await existingUser.save();
        } else {
            // Yangi foydalanuvchi yaratamiz (isVerified: false bo'ladi default)
            await User.create({ email, password: hashedPassword, verificationCode: code });
        }

        const emailSent = await sendVerificationEmail(email, code);
        if (!emailSent) {
            return res.status(500).json({ message: "Email yuborishda xatolik yuz berdi." });
        }

        res.status(201).json({ message: "Emailingizga tasdiqlash kodi yuborildi." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        if (user.verificationCode !== code) return res.status(400).json({ message: "Kod xato!" });

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: true, // HTTPS orqali ishlashi uchun (Vercel shuni talab qiladi)
            sameSite: 'none', // Turli domenlar o'rtasida cookie yuborish uchun
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ message: "Email tasdiqlandi!", accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        // Faqat tasdiqlangan foydalanuvchilarga ruxsat
        if (!user || !user.isVerified) return res.status(404).json({ message: "Foydalanuvchi topilmadi yoki email tasdiqlanmagan!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Parol xato!" });

        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: true, // HTTPS orqali ishlashi uchun (Vercel shuni talab qiladi)
            sameSite: 'none', // Turli domenlar o'rtasida cookie yuborish uchun
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email, isVerified: true });
        if (!user) return res.status(404).json({ message: "Ushbu email bilan tasdiqlangan foydalanuvchi topilmadi!" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        await user.save();

        const emailSent = await sendVerificationEmail(email, code);
        if (!emailSent) return res.status(500).json({ message: "Email yuborishda xatolik." });

        res.json({ message: "Emailingizga tiklash kodi yuborildi." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, isVerified: true });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        if (user.verificationCode !== code) return res.status(400).json({ message: "Kod xato!" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationCode = undefined;
        await user.save();

        res.json({ message: "Parol muvaffaqiyatli yangilandi!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    const cookieToken = req.cookies.refreshToken;
    if (!cookieToken) return res.sendStatus(401);

    jwt.verify(cookieToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        const user = await User.findById(decoded.id);
        if (!user || !user.isVerified) return res.sendStatus(404);

        const newAccess = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken: newAccess });
    });
};
