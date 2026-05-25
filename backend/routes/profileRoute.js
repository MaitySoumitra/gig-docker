const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const userAuth = require('../middleware/userAuth');
const authenticate = require('../middleware/auth');
const mongoose=require('mongoose')

// ✅ Create profile (only for tutor/institute)
router.post('/', userAuth, async (req, res) => {
  const {
    type,
    location,
    experience,
    description,
    contactInfo,
    profileImage
  } = req.body;

  if (!['tutor', 'institute'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only tutors or institutes can create profiles' });
  }

  if (!['private_tutor', 'coaching_center', 'small_institute'].includes(type)) {
    return res.status(400).json({ message: 'Invalid profile type' });
  }

  try {
    const existing = await Profile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const profile = new Profile({
      user: req.user.id,
      type,
      location,
      experience,
      description,
      contactInfo,
      profileImage,
      status: 'under_review'
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get current user's profile
router.get('/me', userAuth, async (req, res) => {
 

  try {
    // Log what comes from middleware
   

    // Find profile
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    
    // Log query result
   

    if (!profile) {
     
      return res.status(404).json({ message: 'No profile found for this user' });
    }

 
    res.status(200).json({ profile });

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Update profile
router.put('/me', userAuth, async (req, res) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete profile
router.delete('/me', userAuth, async (req, res) => {
  try {
    const deleted = await Profile.findOneAndDelete({ user: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all profiles (for students to browse)
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'name email role');
    res.status(200).json({ profiles });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Search profiles by location or name
router.get('/search', async (req, res) => {
  const { location } = req.query;

  try {
    const filters = {};
    if (location) filters.location = { $regex: location, $options: 'i' };

    const results = await Profile.find(filters).populate('user', 'name email role');
    res.status(200).json({ results });
  } catch (err) {
    console.error('Error searching profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ... existing imports

// 🆕 ✅ Get a single profile by ID with all related data (for public view)
router.get('/:id/full', async (req, res) => {
    try {
        const profileId = req.params.id;

        // 1. Fetch the Profile and populate the core User data
        let profile = await Profile.findById(profileId)
            .populate('user', 'name') // Populate the name field of the profile owner
            .populate({
                path: 'reviews', // Populate the array of Reviews
                populate: {
                    path: 'user', // For each review, populate the User who wrote it
                    select: 'name'
                }
            })
            .lean(); // Use .lean() for faster query results since we won't be modifying the document

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // 2. Fetch Subjects and Library Items separately, as they are linked to the User, not the Profile itself
        // NOTE: The Subject and Library schemas link to 'User', which is the profile owner (profile.user._id)
        
        // Ensure profile.user exists and has an ID after population
        const userId = profile.user._id; 
        
        const subjects = await mongoose.model('Subject').find({ user: userId });
        const libraryItems = await mongoose.model('Library').find({ uploadedBy: userId });
        
        // 3. Combine all data into the expected FullProfile structure
        const fullProfileData = {
            ...profile,
            subjects: subjects,
            libraryItems: libraryItems,
        };

        res.status(200).json(fullProfileData);

    } catch (err) {
        // Log the full error, which is helpful for debugging mongoose population issues
        console.error('Error fetching full profile:', err);
        // Check if the ID format is invalid
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid profile ID format' });
        }
        res.status(500).json({ message: 'Server error while fetching full profile' });
    }
});

// ... rest of the existing routes (router.get('/',...), router.get('/search',...), etc.)

module.exports = router;
