const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Message = require('./models/Message');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/chatApp' })
}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

// Routes
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        req.session.userId = user._id;
        req.session.username = user.username; // Save username in session
        res.redirect('/chatroom');
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

app.post('/signup', async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();
        req.session.userId = newUser._id;
        req.session.username = newUser.username; // Save username in session
        res.redirect('/chatroom');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
    }
});

// Chatroom routes
app.get('/chatroom', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({ room: 'General' }).populate('user');
        res.render('chat', { title: 'Chatroom', messages });
    } catch (err) {
        console.error('Error loading chatroom:', err);
        res.status(500).send('Error loading chatroom');
    }
});

app.post('/send-message', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const message = new Message({
            text: req.body.message,
            nickname: req.session.username, // Use username from session
            room: 'General',
            user: req.session.userId
        });
        await message.save();
        const populatedMessage = await Message.findById(message._id).populate('user');
        console.log('Message saved:', populatedMessage);
        res.json(populatedMessage);
    } catch (err) {
        console.error('Error posting message:', err);
        res.status(500).send('Error posting message');
    }
});

app.put('/edit-message/:id', authMiddleware.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    try {
        await Message.findByIdAndUpdate(id, { text: message });
        res.sendStatus(200);
    } catch (err) {
        console.error('Error editing message:', err);
        res.status(500).send('Error editing message');
    }
});

app.delete('/delete-message/:id', authMiddleware.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await Message.findByIdAndDelete(id);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error deleting message:', err);
        res.status(500).send('Error deleting message');
    }
});

app.get('/search-messages', authMiddleware.isAuthenticated, async (req, res) => {
    const { searchTerm } = req.query;
    try {
        const messages = await Message.find({
            room: 'General',
            text: { $regex: searchTerm, $options: 'i' }
        }).populate('user');
        res.render('chat', { title: 'Chatroom', messages });
    } catch (err) {
        console.error('Error searching messages:', err);
        res.status(500).send('Error searching messages');
    }
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

mongoose.connect('mongodb://localhost:27017/chatApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
