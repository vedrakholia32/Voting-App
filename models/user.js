const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the erons schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }

});

userSchema.pre('save', async function(next){
    const user = this;
    // Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();
    try {
        // Hash password generation
        const salt = await bcrypt.genSalt(10);

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        //Override the plain pasword with the hashed one
        user.password = hashedPassword;

        next()
    } catch (error) {
        return next(error)
        
    }
    
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
        return isMatch
    } catch (error) {
        return next(error)
    }
}



const User = mongoose.model('User', userSchema);
module.exports = User