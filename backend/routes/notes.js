const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Notun Note Add Korar API
router.post('/add', async (req, res) => {
    try {
        const { userId, courseTitle, courseCode, notesContent } = req.body;
        const newNote = new Note({ userId, courseTitle, courseCode, notesContent });
        await newNote.save();
        res.status(201).json({ message: 'Note added successfully!', newNote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Nirdisto User-er Notes Get Korar API
router.get('/:userId', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.params.userId });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;