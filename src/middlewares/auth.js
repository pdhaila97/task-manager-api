const User = require("../models/user");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try { 
        const token = req.header('Authorization').replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

        if(!user) {
            throw new Error("Authorization failed");
        }

        req.user = user;
        req.token = token;

        next();

    } catch (err) {
        res.status(500).send(err)
    }

}

module.exports = auth;