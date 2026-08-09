const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(cors({
  origin: ["https://campuscare-bd.netlify.app", "http://localhost:5173"],
  credentials: true
}));
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.log("Uploads directory creation skipped or not permitted:", err.message);
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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
        const filePath = req.file ? `/uploads/${req.file.filename}` : '';
        
        const newNote = new Note({ 
            userId, 
            courseTitle, 
            courseCode, 
            notesContent, 
            attachment: filePath 
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
            updateData.attachment = `/uploads/${req.file.filename}`;
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