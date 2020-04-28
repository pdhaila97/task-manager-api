const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    age: {
        type: Number,
        default: 12,
        validate(value) {
            if(value < 12) {
                throw new Error("Age should be more than 12!")
            }
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Not a valid Email!")
            }
        },
        required: true
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(value) {
            if(validator.contains(value, "password")) {
                throw new Error("Password shouldn't contain \'password\'")
            }
        }
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    avatar: {
        type: Buffer
    }
});

UserSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    delete user.avatar;
    return user;
}

// Create Auth Token for the user

UserSchema.methods.getAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);
    user.tokens.push({token});
    await user.save();
    return token;
}

// Hash Password before saving

UserSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Find user by credentials

UserSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email});
    if(!user) {
        throw new Error("Unable to login!");
    }

    const isPassMatch = await bcrypt.compare(password, user.password);

    if(!isPassMatch) {
        throw new Error("Unable to login!");
    }

    return user;
}


const User = mongoose.model("User", UserSchema);

module.exports = User;