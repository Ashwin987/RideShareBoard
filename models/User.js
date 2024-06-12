const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    username: {
        type: String,
        required: function() {
            return !this.googleId; // Username is required if googleId is not present
        }
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required if googleId is not present
        }
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
