const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const Task = require('../models/task');
const multer = require('multer');
const sharp = require('sharp');

router.post('/tasks',auth , async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch(error) {
        res.status(400).send(error);
    }
    // task.save().then((result) => {
    //     res.status(201).send(result);
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

router.get('/tasks',auth , async (req,res) => {
    try {
        //const tasks = await Task.find({owner: req.user._id}); // populate method can also be used(explained in index.js)
        const match = {};
        const sort = {};

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split('_');
            sort[parts[0]] = parts[1]==='desc' ? -1 : 1; // -1 is desc
        }

        if (req.query.completed) {
            match.completed = req.query.completed==='true';
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks); 
    } catch (error) {
        res.status(500).send(error);
    }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks);
    // }).catch((error) => {
    //     res.status(500).send(error);
    // })
});

router.get('/tasks/:id',auth , async (req,res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch(error) {
        res.status(500).send({error});
    }
    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         res.status(404).send();
    //     }
    //     res.send(task);
    // }).catch((error) => {
    //     res.status(500).send(error);
    // });
});

router.patch('/tasks/:id',auth , async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];

    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        return res.status(400).send('Invalid updates');
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save(); // This save function will take it through the middleware schema, so that we can run some function before save or after save and more
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.send(task);
    } catch {
        res.send(400).send();
    }
});

router.delete('/tasks/:id',auth , async (req,res) => {
    try {
        const task = await Task.findOneAndRemove({_id:req.params.id, owner: req.user._id});
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch(error) {
        res.status(500).send(error);
    }
});

const upload = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Upload only in jpg, jpeg or png formats'));
        }
        cb(undefined,true);
    }
});

router.post('/tasks/pic/:id', auth, upload.single('pic'), async(req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 400, height: 400}).png().toBuffer();
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if (!task) {
        return res.status(404).send({error: 'No such task'});
    }
    task.pic = buffer;
    await task.save();
    res.send();
}, (error, req, res, next) => {
    res.satus(400).send({error: error.message});
});

router.get('/tasks/pic/:id', auth, async(req,res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task || !task.pic) {
            throw new Error('404 not found');
        }
        res.set('Content-Type', 'image/png');
        res.send(task.pic);
    } catch (error) {
        res.status(400).send('Failed to get image');
    }
});

router.delete('/tasks/pic/:id', auth, async (req,res) => {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if (!task) {
        return res.status(404).send({error: 'No such task'});
    }
    task.pic = undefined;
    await task.save();
    res.send();
});

module.exports = router;