const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
require('dotenv').config();

// ফায়ারবেস সার্ভিস অ্যাকাউন্ট কি ফাইল কানেক্ট করা
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com"
});

const bucket = admin.storage().bucket();
const app = express();

app.use(cors({
    origin: ["https://campuscare-bd.netlify.app", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json());

// মেমোরি স্টোরেজ ব্যবহার করা (ফাইল সরাসরি ফায়ারবেসে পাঠানোর জন্য)
const upload = multer({ storage: multer.memoryStorage() });

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.log("Database connection error: ", err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    courseCode: { type: String, required: true },
    notesContent: { type: String, required: true },
    attachment: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email!" });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'Registration successful!', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }
        res.status(200).json({ message: 'Login successful!', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notes/add', upload.single('file'), async (req, res) => {
    try {
        const { userId, courseTitle, courseCode, notesContent } = req.body;
        let fileUrl = '';
        
        if (req.file) {
            const fileName = Date.now() + "_" + req.file.originalname;
            const fileUpload = bucket.file(fileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            await new Promise((resolve, reject) => {
                blobStream.on('error', (error) => reject(error));
                blobStream.on('finish', async () => {
                    fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    resolve();
                });
                blobStream.end(req.file.buffer);
            });
        }
        
        const newNote = new Note({ 
            userId, 
            courseTitle, 
            courseCode, 
            notesContent, 
            attachment: fileUrl 
        });
        await newNote.save();
        res.status(201).json({ message: 'Note added successfully!', newNote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notes/:userId', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notes/edit/:id', upload.single('file'), async (req, res) => {
    try {
        const { courseTitle, courseCode, notesContent } = req.body;
        let updateData = { courseTitle, courseCode, notesContent };
        
        if (req.file) {
            const fileName = Date.now() + "_" + req.file.originalname;
            const fileUpload = bucket.file(fileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            await new Promise((resolve, reject) => {
                blobStream.on('error', (error) => reject(error));
                blobStream.on('finish', async () => {
                    updateData.attachment = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    resolve();
                });
                blobStream.end(req.file.buffer);
            });
        }

        const updatedNote = await Note.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: 'Note updated successfully!', updatedNote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Note deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});