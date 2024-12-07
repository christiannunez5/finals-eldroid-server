import express from "express";
import mongoose from "mongoose";
import { User } from "./users.js";
import cors from "cors";
import { upload } from "./multer.js";
import cloudinary from "./cloudinary.js";

const app = express();
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
    console.log("METHOD: " + req.method);
    console.log("URL: " + req.url);
    next();
});

app.get("/", async (req, res) => {
    const users = await User.find();
    res.send(users);
});

app.post("/register", upload.single("image"), async (req, res) => {
    const { email, password } = req.body;
    const image = req.file;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exist" });
        }
        let imageURL = undefined;
        if (image) {
            imageURL = await cloudinary.uploader.upload(image.path);
        }
        const newUser = new User({
            email: email,
            password: password,
            image: imageURL ? imageURL.secure_url : "",
        });
        await newUser.save();
        return res
            .status(201)
            .json({ message: "User created!", data: newUser });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        if (existingUser.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        return res
            .status(200)
            .json({ message: "Login successfully", data: existingUser });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.post("/update/:userId", upload.single("image"), async (req, res) => {
    const { userId } = req.params;

    const { email, password } = req.body;
    const image = req.file;

    try {
        if (email) {
            const existingUser = await User.findOne({
                email,
            });

            if (existingUser) {
                return res.status(400).json({ error: "Email already in use" });
            }
        }

        let imageURL = undefined;

        if (image) {
            imageURL = await cloudinary.uploader.upload(image.path, {
                upload_preset: "your_preset",
                quality: "auto",
                format: "auto",
            });
        }

        const data = {
            ...req.body,
            image: imageURL ? imageURL.secure_url : "",
        };

        const updatedUser = await User.findOneAndUpdate({ _id: userId }, data, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ error: "User does not exist" });
        }

        res.status(200).json({ message: "Updated user!", data: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

const dbURL =
    "mongodb+srv://nunez123:000357@cluster0.e5jbo8h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(dbURL)
    .then(() => {
        app.listen(8080, () => {
            console.log("listening on port " + 8080);
        });
    })
    .catch((err) => {
        console.log(err);
    });
