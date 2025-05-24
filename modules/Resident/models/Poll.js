const mongoose = require('mongoose');

// Define a schema for Poll
const PollSchema = new mongoose.Schema({
    pollType: {
        type: String,
        required: true,
        enum: ['Multichoice', 'Singlechoice', 'Ranking', 'Rating', 'Numeric', 'Text'],
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String], // Array of options
        required: true,
    },
    responses: [
        {
            residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
            selectedOption: { type: String },
        }
    ],
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports =  mongoose.models.Poll || mongoose.model('Poll', PollSchema);