import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to, code) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error("❌ Xatolik: EMAIL_USER yoki EMAIL_PASS topilmadi!");
        return false;
    }

    // DEBUG rejimida transporter yaratish
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass
        },
        debug: true, // SMTP ma'lumotlarini terminalda chiqaradi
        logger: true // Jarayonni log qiladi
    });

    try {
        console.log(`🚀 Xat yuborishga urinish: ${to} manziliga...`);
        
        const mailOptions = {
            from: `"Praktika" <${user}>`,
            to: to, // Kiritilgan email
            subject: "Sizning tasdiqlash kodingiz",
            html: `<h3>Tasdiqlash kodi: ${code}</h3>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Nodemailer xabari:", info.response);
        return true;
    } catch (error) {
        console.error("❌ Nodemailer xatosi:", error.message);
        return false;
    }
};
