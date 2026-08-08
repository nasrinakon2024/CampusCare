const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    courseTitle: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    notesContent: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);