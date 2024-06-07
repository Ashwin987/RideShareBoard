// controllers/chatController.js
const Room = require('../models/Room');

exports.getChatroom = async (req, res) => {
    try {
        const messages = await Room.find({});
        res.render('chat', { title: 'Chatroom', messages });
    } catch (err) {
        console.error('Error loading chatroom:', err);
        res.status(500).send('Error loading chatroom');
    }
};

exports.postMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const newMessage = new Room({ message, user: req.session.userId });
        await newMessage.save();
        res.redirect('/chat');
    } catch (err) {
        console.error('Error posting message:', err);
        res.status(500).send('Error posting message');
    }
};
