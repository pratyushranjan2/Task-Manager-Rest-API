const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('email invalid');
        },
        trim: true,
        lowercase: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) throw new Error('Age must be a positive number'); 
        },
        default: 0
    },
    password: {
        trim: true,
        required: true,
        type: String,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) 
                throw new Error('Password length must be greater than 6');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.createAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {'expiresIn': '7 days'});
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch) {
        throw new Error('Unable to login p');
    }
    return user;
}

// Hashing password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    //console.log('just before saving');
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8);
    }
    next(); // call next to continue save after everything
});

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;