import express from 'express';
import Profile from '../models/Profile.js';
import { timezones, isValidTimezone } from '../utils/timezoneUtils.js';

const router = express.Router();

// GET /api/profiles - Get all active profiles
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all active profiles...');
    
    const profiles = await Profile.getActiveProfiles();
    
    console.log(`Found ${profiles.length} active profiles`);
    
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
    
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles',
      error: error.message
    });
  }
});

// GET /api/profiles/:id - Get single profile
router.get('/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    console.log(`Fetching profile with ID: ${profileId}`);
    
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    if (!profile.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Profile is not active'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// POST /api/profiles - Create new profile
router.post('/', async (req, res) => {
  try {
    const { name, timezone = 'UTC' } = req.body;
    
    console.log('Creating new profile:', { name, timezone });
    
    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required'
      });
    }
    
    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }
    
    // Check if profile with same name already exists
    const existingProfile = await Profile.findOne({ 
      name: name.trim(),
      isActive: true 
    });
    
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile with this name already exists'
      });
    }
    
    // Create new profile
    const newProfile = new Profile({
      name: name.trim(),
      timezone
    });
    
    const savedProfile = await newProfile.save();
    
    console.log('Profile created successfully:', savedProfile._id);
    
    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: savedProfile
    });
    
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create profile',
      error: error.message
    });
  }
});

// PUT /api/profiles/:id/timezone - Update profile timezone
router.put('/:id/timezone', async (req, res) => {
  try {
    const profileId = req.params.id;
    const { timezone } = req.body;
    
    console.log(`Updating timezone for profile ${profileId} to ${timezone}`);
    
    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: 'Timezone is required'
      });
    }
    
    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }
    
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    if (!profile.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update inactive profile'
      });
    }
    
    // Update timezone
    profile.timezone = timezone;
    const updatedProfile = await profile.save();
    
    console.log('Timezone updated successfully');
    
    res.json({
      success: true,
      message: 'Timezone updated successfully',
      data: updatedProfile
    });
    
  } catch (error) {
    console.error('Error updating timezone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timezone',
      error: error.message
    });
  }
});

// GET /api/profiles/utils/timezones - Get available timezones
router.get('/utils/timezones', (req, res) => {
  res.json({
    success: true,
    data: timezones
  });
});

export default router;