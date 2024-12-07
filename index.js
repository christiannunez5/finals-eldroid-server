import express from "express";
import mongoose from "mongoose";
import { User } from "./users.js";
import cors from "cors";
import { upload } from "./multer.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    console.log("METHOD: " + req.method);
    console.log("URL: " + req.url);
    next();
});

app.get("/", async (req, res) => {
    const users = await User.find();
    res.send(users);
});

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    const user = await User.findOne({ _id: id });

    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    return res.send(user);
});

app.post("/register", upload.single("image"), async (req, res) => {
    const { email, password } = req.body;

    console.log(req.body); // Form fields

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exist" });
        }

        const image = req.file ? `${req.file.filename}` : "";

        const newUser = new User({
            email: email,
            password: password,
            image: image,
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
    const { email, password, removeImage } = req.body;

    try {
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        const data = {
            email: email,
            password: password,
            image: user.image, // Default to the current image
        };

        if (removeImage) {
            data.image = "";
        } else if (req.file) {
            data.image = req.file.filename;
        }

        const updatedUser = await User.findOneAndUpdate({ _id: userId }, data, {
            new: true,
        });

        res.status(200).json({ message: "Updated user!", data: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: error.message });
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
