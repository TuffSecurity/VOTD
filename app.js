require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

const uri = process.env.URI;

async function run() {
    try {
        // Just connect to MongoDB without deprecated options
        await mongoose.connect(uri);
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    }
}
//schemas
const prayerSchema = new mongoose.Schema({
    prayerTitle: String,
    prayerBody: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const Prayer = mongoose.model("Prayer", prayerSchema);

const momPrayerSchema = new mongoose.Schema({
    prayerTitle: String,
    prayerBody: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const MomPrayer = mongoose.model("MomPrayer", momPrayerSchema);


// Define Mongoose schema and model
const bookmarkSchema = new mongoose.Schema({
    verse: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const momBookmarkSchema = new mongoose.Schema({
    verse: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

const MomBookmark = mongoose.model("MomBookmark", momBookmarkSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "choose.html"));
});

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    const users = {
        "Mary Elaine": process.env.GMA_PASS,
        "Mary Denten": process.env.MOM_PASS,
    };
    if (users[name] && users[name] === password) {
        res.status(200).send({ success: true, redirect: `/${name === "Mary Elaine" ? "gma" : "mom"}` });
    } else {
        res.status(400).send({ success: false, message: "Incorrect Credentials" });
    }
});

app.post('/saveBookmark', async (req, res) => {
    const { verse } = req.body;
    if (!verse) {
        return res.status(400).send({ error: "Verse is required" });
    }
    try {
        const newBookmark = new Bookmark({ verse });
        await newBookmark.save();
        res.status(201).send({ success: true, message: "Bookmark saved successfully" });
    } catch (error) {
        console.error("Error saving bookmark:", error);
        res.status(500).send({ success: false, message: "Error saving bookmark" });
    }
});

app.get('/getBookmarks', async (req, res) => {
    try {
        const bookmarks = await Bookmark.find().sort({ date: -1 });
        res.status(200).send({ success: true, bookmarks });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).send({ success: false, message: "Error fetching bookmarks" });
    }
});
// mom server
app.post('/saveMomBookmark', async (req, res) => {
    const { verse } = req.body;
    if (!verse) {
        return res.status(400).send({ error: "Verse is required" });
    }
    try {
        const newBookmark = new MomBookmark({ verse });
        await newBookmark.save();
        res.status(201).send({ success: true, message: "Bookmark saved successfully" });
    } catch (error) {
        console.error("Error saving bookmark:", error);
        res.status(500).send({ success: false, message: "Error saving bookmark" });
    }
});

app.get('/getMomBookmarks', async (req, res) => {
    try {
        const bookmarks = await MomBookmark.find().sort({ date: -1 });
        res.status(200).send({ success: true, bookmarks });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).send({ success: false, message: "Error fetching bookmarks" });
    }
});

app.post('/savePrayer', async (req, res) => {
    const { prayerTitle, prayerBody } = req.body;

    if (!prayerTitle || !prayerBody) {
        return res.status(400).send({ error: "Title and Content are required" });
    }

    try {
        const newPrayer = new Prayer({ prayerTitle, prayerBody });
        const savedPrayer = await newPrayer.save();
        res.status(201).send({ success: true, message: "Prayer saved successfully", prayer: savedPrayer });
    } catch (error) {
        console.error("Error saving prayer:", error);
        res.status(500).send({ success: false, message: "Error saving prayer" });
    }
});

app.get('/getPrayers', async (req, res) => {
    try {
        const prayers = await Prayer.find().sort({ date: -1 });
        res.status(200).send({ success: true, prayers });
    } catch (error) {
        console.error("Error fetching prayers:", error);
        res.status(500).send({ success: false, message: "Error fetching prayers" });
    }
});

app.delete('/deletePrayer/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPrayer = await Prayer.findByIdAndDelete(id);
        if (!deletedPrayer) {
            return res.status(404).send({ success: false, message: "Prayer not found" });
        }
        res.status(200).send({ success: true, message: "Prayer deleted successfully" });
    } catch (error) {
        console.error("Error deleting prayer:", error);
        res.status(500).send({ success: false, message: "Error deleting prayer" });
    }
});

//mom server
app.post('/saveMomPrayer', async (req, res) => {
    const { prayerTitle, prayerBody } = req.body;

    if (!prayerTitle || !prayerBody) {
        return res.status(400).send({ error: "Title and Content are required" });
    }

    try {
        const newPrayer = new MomPrayer({ prayerTitle, prayerBody });
        const savedPrayer = await newPrayer.save();
        res.status(201).send({ success: true, message: "Prayer saved successfully", prayer: savedPrayer });
    } catch (error) {
        console.error("Error saving prayer:", error);
        res.status(500).send({ success: false, message: "Error saving prayer" });
    }
});

app.get('/getPrayers', async (req, res) => {
    try {
        const prayers = await MomPrayer.find().sort({ date: -1 });
        res.status(200).send({ success: true, prayers });
    } catch (error) {
        console.error("Error fetching prayers:", error);
        res.status(500).send({ success: false, message: "Error fetching prayers" });
    }
});

app.delete('/deletePrayer/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPrayer = await MomPrayer.findByIdAndDelete(id);
        if (!deletedPrayer) {
            return res.status(404).send({ success: false, message: "Prayer not found" });
        }
        res.status(200).send({ success: true, message: "Prayer deleted successfully" });
    } catch (error) {
        console.error("Error deleting prayer:", error);
        res.status(500).send({ success: false, message: "Error deleting prayer" });
    }
});

app.get('/gma', (req, res) => {
    res.sendFile(path.join(__dirname, "gma", "gma.html"));
});

app.get('/mom', (req, res) => {
    res.sendFile(path.join(__dirname, "mom", "mom.html"));
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on Port: ${port}, go to http://localhost:3000`);
});

// Run the connection function to MongoDB
run();
