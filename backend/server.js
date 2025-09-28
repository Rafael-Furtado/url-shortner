require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shortid = require("shortid");

const app = express();

app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); 
  }
};

connectDB();

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true }
});

const Url = mongoose.model("Url", urlSchema);

// shorten API p/ encurtar URls
app.post("/app/shorten", async (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = shortid.generate();
    const newUrl = new Url({ originalUrl, shortUrl })
    await newUrl.save();
    res.status(201).json({ originalUrl, shortUrl });
})

// Redirect API to handle redirection of shortened URLs

app.get("/:shortUrl", async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (url) {
        return res.redirect(url.originalUrl);
    } else {
        return res.status(400).json("URL not found");
    }
})

const port = process.env.PORT;

app.listen(port, () => console.log(`Server running on port ${port}`) )