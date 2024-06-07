const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    messages: [messageSchema]
});

module.exports = mongoose.model('Room', roomSchema);
