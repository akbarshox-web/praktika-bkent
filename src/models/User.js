import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String }
}, { timestamps: true });

// MANA SHU QATOR JIKARLI:
const User = mongoose.model('User', userSchema);
export default User;