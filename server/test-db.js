import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Attempting to connect to MongoDB...");
// Mask password for safety in logs, but show the rest
const uri = process.env.MONGO_URI || "";
console.log("URI Format Check:", uri.replace(/:([^:@]+)@/, ":****@"));

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connected successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection failed:", err.message);
        console.error("Full Error:", err);
        process.exit(1);
    });
