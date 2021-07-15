const express = require('express');
const app = express();
require("./db/mongoose");
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(express.json()); // autmatically parse incoming json
app.use(userRouter);
app.use(taskRouter);

module.exports = app;