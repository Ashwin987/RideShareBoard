// middleware/authMiddleware.js

module.exports.isAuthenticated = (req, res, next) => {
    console.log('Checking authentication');
    console.log('Session data:', req.session);
    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        return next();
    } else {
        console.log('User is not authenticated');
        res.redirect('/login');
    }
};
