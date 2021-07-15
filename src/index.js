const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => {
    console.log('Server is up on port '+port);
});

// const Task = require('./models/task');
// const User = require('./models/user');
// const func = async() => {
//     // const task = await Task.findById('60c34699f280ffbf16f5ff31');
//     // await task.populate('owner').execPopulate();
//     // return task.owner;

//     const user = await User.findById('60c345447efbffbee4e618ae');
//     await user.populate('tasks').execPopulate();
//     return user.tasks;
// }

// func().then((owner)=>{console.log(owner)}).catch((error)=>{console.log(error)});