import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: {
        type: String,
        reqired: true,
        unique: true,
    },
    password: {
        type: String,
        reqired: true,
    },
    image: {
        type: String,
        required: false,
    },
});

export const User = mongoose.model("User", userSchema);