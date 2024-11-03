const express = require('express');
const User = require('../models/user');
const router = express.Router()
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//Signup
router.post('/signup', async (req, res) => {
    try {
        const data = req.body

        // Create a new User decument using the Mongoose model
        const newUser = new User(data);

        // Save the new user in database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
        }
        
        const token = generateToken(payload)
        console.log('Token is:', token);
        
        res.status(200).json({response:response, token:token})

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server Error' });

    }

})

// Login router
router.post('/login', async (req, res)=>{
    try { 
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Find the user bu aadharCardNumber
        const user = await User.findOne({aadharCardNumber:aadharCardNumber})
        
        // If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"Invalid username or password"});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }

        const token = generateToken(payload);
        //return token as response
        res.json({token})

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res)=>{
    try {
        const userData = req.user;
        const userID = userData.userData.id;
        const user = await User.findById(userID);
        res.status(200).json(user)  ;      
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try{
        const userId = req.userData.user; // Extract the id from the Token
        const {currentPassword, newPassword} = req.body // Extract current new password from request body
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user bu userID
        const user = await User.findById(userId);

        // If password does not match, return error
        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:"Invalid username or password"});
        }

        user.password = newPassword
        await user.save()

        console.log('password updated');
        res.status(200).json({message:'password updated'})
    }catch(error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server Error' });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const UserId = req.params.id;

        const response = await User.findByIdAndDelete(UserId);
        if (!response) {
            return res.status(404).json({ error: 'User not found ' })
        }
        console.log('data deletes');
        res.status(200).json({ message: "User Deleted Successfully" })


    } catch (error) {

    }
})

module.exports = router