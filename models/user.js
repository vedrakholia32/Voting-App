const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the erons schema
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
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