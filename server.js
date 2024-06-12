const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const Message = require('./models/Message');
const authMiddleware = require('./middleware/auth');
const hbs = require('hbs');

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

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: '223743386237-j4l2c21iabcmc08rgvr5puu5s4d3kneq.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:8080/auth/google/callback'
},
async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Set the view engine to hbs
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user.username) {
            return res.redirect('/set-username');
        }
        req.session.userId = req.user._id;
        req.session.username = req.user.username;
        res.redirect('/chatroom');
    }
);

app.get('/set-username', (req, res) => {
    res.render('set-username', { title: 'Set Username' });
});

app.post('/set-username', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const username = req.body.username.trim();
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return res.status(400).send('Username already taken');
            }

            const user = await User.findById(req.user._id);
            user.username = username;
            await user.save();

            req.session.username = username; // Save username in session
            res.redirect('/chatroom');
        } catch (err) {
            console.error('Error setting username:', err);
            res.status(500).send('Error setting username');
        }
    } else {
        res.redirect('/login');
    }
});

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
        console.log('req.session:', req.session); // Debug statement
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

app.get('/search-messages', async (req, res) => {
    const { query } = req.query;
    console.log('Search query received:', query);
    try {
        const messages = await Message.find({
            text: { $regex: new RegExp(query, 'i') }
        });
        console.log('Search results:', messages);
        res.json(messages);
    } catch (err) {
        console.error('Error searching messages:', err);
        res.status(500).send('Error searching messages');
    }
});
