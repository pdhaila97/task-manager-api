const express = require("express");

const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middlewares/auth")

// Tasks related APIs

// Create task
router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        'owner': req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err)
    }
});

// Get all tasks
router.get("/tasks", auth, async (req, res) => {
    try {
        // const tasks = await Task.find({owner: req.user._id});
        const limit = parseInt(req.query.limit);
        const skip = parseInt(req.query.skip);
        const sortBy = req.query.sortBy;
        const completed = req.query.completed;
        const match = {};
        const sort = {};
        
        if(completed) {
            match.completed = completed === 'true';
        }
        if(sortBy) {
            const sortQueryArr = sortBy.split(":");
            sort[sortQueryArr[0]] = sortQueryArr[1] === "desc" ? -1 : 1;
        }

        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options: {
                skip,
                limit,
                sort
            }
        }).execPopulate();
        res.send(user.tasks);
    } catch (err) {
        res.status(500).send();
    }
});

// Get task by ID
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            return res.status(404).send()
        }
        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

// Update task by ID
router.patch("/tasks/:id", auth, async (req, res) => {

    if(!req.params.id) {
        return res.status(404).send("ID not provided!!");
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidUpdate) {
        return res.status(500).send("Invalid set of update params!!")
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete Task by ID 
router.delete("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id});

        if(!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;