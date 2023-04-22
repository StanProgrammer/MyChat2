const jwt = require('jsonwebtoken');
const User = require('../models/users');
const SECRET_KEY = process.env.SECRET_KEY;

exports.authorization = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.redirect('login.html');
        }

        const user = jwt.verify(token, SECRET_KEY);
        User.findByPk(user.id).then((user) => {
            if (user) {
                req.user = user;
                next();
            } else {
                return res.redirect('/login.html');
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
};
