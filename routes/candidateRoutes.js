const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require('../models/candidate');
const { Types: { ObjectId } } = require('mongoose'); // Import ObjectId to validate

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// To add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.userData.id)))            
            return res.status(403).json({ message: 'User does not have admin role' });

        const data = req.body; // Assuming the request body contains the candidate data
        const newCandidate = new Candidate(data);
        newCandidate.voteCount = newCandidate.voteCount || 0;

        const response = await newCandidate.save();
        console.log('Data saved');
        res.status(200).json({ response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userID = userData.id;
        const user = await User.findById(userID);
        res.status(200).json(user);      
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.userData.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const candidateId = req.params.candidateId; // Extract the id from the URL parameter

        // Validate the candidate ID
        if (!ObjectId.isValid(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }

        const updatedCandidateData = req.body; // Updated data for the candidate

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true // Run Mongoose Validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server Error' });
    }
});

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.userData.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const candidateId = req.params.candidateId; // Extract the id from the URL parameter

        // Validate the candidate ID
        if (!ObjectId.isValid(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data deleted');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId; // Use correct parameter

    console.log('Received candidate ID:', candidateId);

    // Validate the candidate ID
    if (!ObjectId.isValid(candidateId)) {
        return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const userId = req.user.userData.id;

    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update the user document
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidates.map((data)=>{
            return {
                party: data.party,
                VoteCount: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
module.exports = router;
