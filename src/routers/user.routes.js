const express = require("express");

const router = new express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeMail, sendCancellationEmail} = require("../email/accounts")

const avatar = multer({
    limits:{
        fileSize: 2*1024*1024
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.toLowerCase().match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error("Only Images are supported. JPEG, JPG, PNG"));
        }

        cb(undefined, true);
    }
});

// Users related APIs

// Create User
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeMail(user.name, user.email)
        const token = await user.getAuthToken();
        res.status(201).send({user, token});
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get user profile 
router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (err) {
        res.status(404).send();
    }
});

// Update User by ID
router.patch("/users/me", auth, async (req, res) => {
    try {
        const user = req.user;
        const updates = Object.keys(req.body);
        updates.forEach((update) => {
            user[update] = req.body[update];
        });
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete User
router.delete("/users/me", auth, async (req, res) => {
    
    try {
        req.user.remove();
        sendCancellationEmail(req.user.name, req.user.email)
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Login User
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthToken(user);

        res.send({user, token});
    } catch (err) {
        res.status(404).send(err);
    }
});

// Logout User
router.post("/users/logout", auth, async (req, res) => {
    try {
        const logoutAll = req.query.all;
        const user = req.user;
        
        user.tokens = logoutAll ? [] : user.tokens.filter(token => token.token !== req.token);
        await user.save();
        res.send();
    }catch (err) {
        res.status(500).send();
    }
});

// Upload Avatar for User
router.post("/users/me/avatar", auth, avatar.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
});


// Delete Avatar for User
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
});


// Get User Avatar
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar)
    } catch (err) {
        res.status(400).send()
    }
})

module.exports = router;
