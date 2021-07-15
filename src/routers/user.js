const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account');

router.post('/users', async (req,res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.createAuthToken();
        //sendWelcomeEmail(user.email, user.name);
        res.status(201).send({user, token});
    } catch(error) {
        res.status(400).send(error);
    }
    // user.save().then((result) => {
    //     res.status(201).send(result);
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.createAuthToken();
        res.send({user, token}); // When we send user in response, express does JSON.stringify() behind the scenes and then sends it
    } catch(error) {
        res.status(400).send(error);console.log(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => req.token !== token.token);
        await req.user.save();
        res.send('Logged out');
    } catch(error) {
        console.log(error);
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('Logged out from all devices');
    } catch(error) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user);
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch(error) {
    //     res.status(500).send(error);
    // }
    // User.find({}).then((users) => {
    //     res.send(users);
    // }).catch((error) => {
    //     res.status(500).send(error);
    // });
});

// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send('User not found');
//         }
//         res.send(user);
//     } catch(error) {
//         res.status(500).send(error);
//     }
//     // User.findById(_id).then((user) => {
//     //     if (!user) {
//     //         return res.status(404).send('User not found');
//     //     }
//     //     res.send(user);
//     // }).catch((error) => {
//     //     res.status(500).send(error);
//     // });
// });

router.patch('/users/me',auth , async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        return res.status(400).send('Invalid updates');
    }
    
    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch(error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.remove();
        //sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch{
        res.status(500).send(error);
    }
});

const upload = multer({
    limits: {
       fileSize: 1000000 
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only jpg, jpeg and png file formats are allowed'));
        }
        cb(undefined,true);
    }
});

router.post('/users/me/avatar',auth ,upload.single('avatar') , async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send(); // The next parameter is a function for handling errors, all 4 properties are important
}, (error,req,res,next) => {
    res.status(400).send({error: error.message});
});

router.delete('/users/me/avatar',auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    } catch(error) {
        res.status(404).send();
    }
});

module.exports = router;