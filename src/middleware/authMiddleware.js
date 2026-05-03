import jwt from 'jsonwebtoken';

// Faqat login qilganlar uchun (Access Token tekshiruvi)
export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Avtorizatsiyadan o'tilmagan" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Yaroqsiz token" });
    }
};

// Faqat adminlar uchun
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Bu amal uchun admin ruxsati kerak" });
    }
};