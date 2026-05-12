import { User } from "../models/user.model.js";
import { generateTokens } from "../utils/token.js";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (exists) {
        return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res.status(201).json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        },
        accessToken,
        refreshToken
    });
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res.status(200).json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        },
        accessToken,
        refreshToken
    });
};
