const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (token, tokenSecret, profile, done) => {
    User.findOne({ googleId: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
            return done(null, existingUser);
        } else {
            const newUser = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });
            newUser.save((err) => {
                if (err) { return done(err); }
                return done(null, newUser);
            });
        }
    });
}));
