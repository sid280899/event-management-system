import express from 'express';
import Event from '../models/Event.js';
import Profile from '../models/Profile.js';
import { isValidTimezone, formatInTimezone } from '../utils/timezoneUtils.js';

const router = express.Router();

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all events...');
    
    const events = await Event.find()
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .sort({ startDateTime: 1 });
    
    console.log(`Found ${events.length} events`);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// GET /api/events/profile/:profileId - Get events for specific profile
router.get('/profile/:profileId', async (req, res) => {
  try {
    const profileId = req.params.profileId;
    console.log(`Fetching events for profile: ${profileId}`);
    
    // Check if profile exists and is active
    const profile = await Profile.findOne({ 
      _id: profileId, 
      isActive: true 
    });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or inactive'
      });
    }
    
    const events = await Event.findByProfile(profileId);
    
    console.log(`Found ${events.length} events for profile ${profileId}`);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching profile events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events for profile',
      error: error.message
    });
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      profiles, 
      timezone, 
      startDateTime, 
      endDateTime,
      createdBy 
    } = req.body;
    
    console.log('Creating new event:', { 
      title, 
      profilesCount: profiles?.length,
      timezone,
      createdBy 
    });
    
    // Validate required fields
    if (!title || !profiles || !timezone || !startDateTime || !endDateTime || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, profiles, timezone, startDateTime, endDateTime, createdBy'
      });
    }
    
    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }
    
    // Check if createdBy profile exists
    const creatorProfile = await Profile.findOne({
      _id: createdBy,
      isActive: true
    });
    
    if (!creatorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid creator profile'
      });
    }
    
    // Check if all assigned profiles exist and are active
    const assignedProfiles = await Profile.find({
      _id: { $in: profiles },
      isActive: true
    });
    
    if (assignedProfiles.length !== profiles.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more assigned profiles are invalid or inactive'
      });
    }
    
    // Parse dates
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    
    // Create new event
    const newEvent = new Event({
      title: title.trim(),
      description: description?.trim() || '',
      profiles,
      timezone,
      startDateTime: startDate,
      endDateTime: endDate,
      createdBy
    });
    
    const savedEvent = await newEvent.save();
    await savedEvent.populate('profiles', 'name timezone');
    await savedEvent.populate('createdBy', 'name');
    
    console.log('Event created successfully:', savedEvent._id);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    
    console.log(`Updating event: ${eventId}`, updates);
    
    const existingEvent = await Event.findById(eventId)
      .populate('profiles', 'name timezone');
    
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Validate timezone if provided
    if (updates.timezone && !isValidTimezone(updates.timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }
    
    // Create update log
    const updateLog = {
      updatedBy: updates.updatedBy,
      previousValues: new Map(),
      updatedValues: new Map()
    };
    
    // Track changes for logging
    const fieldsToCheck = ['title', 'description', 'profiles', 'timezone', 'startDateTime', 'endDateTime'];
    
    fieldsToCheck.forEach(field => {
      if (updates[field] !== undefined) {
        const existingValue = existingEvent[field];
        const newValue = updates[field];
        
        // Convert to string for comparison to handle arrays and dates
        const existingValueStr = JSON.stringify(existingValue);
        const newValueStr = JSON.stringify(newValue);
        
        if (existingValueStr !== newValueStr) {
          updateLog.previousValues.set(field, existingValue);
          updateLog.updatedValues.set(field, newValue);
        }
      }
    });
    
    // Prepare update data
    const updateData = { ...updates };
    
    // Convert date strings to Date objects if provided
    if (updates.startDateTime) {
      updateData.startDateTime = new Date(updates.startDateTime);
    }
    if (updates.endDateTime) {
      updateData.endDateTime = new Date(updates.endDateTime);
    }
    
    // Add update log if there are changes
    if (updateLog.updatedValues.size > 0) {
      updateData.$push = { updateLogs: updateLog };
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('profiles', 'name timezone')
    .populate('createdBy', 'name');
    
    console.log('Event updated successfully');
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
});

// GET /api/events/:id/logs - Get event update logs
router.get('/:id/logs', async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`Fetching logs for event: ${eventId}`);
    
    const event = await Event.findById(eventId)
      .populate('updateLogs.updatedBy', 'name timezone')
      .select('updateLogs title');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Format logs with better structure
    const formattedLogs = event.updateLogs.map(log => ({
      id: log._id,
      updatedBy: log.updatedBy,
      timestamp: log.timestamp,
      changes: Array.from(log.previousValues.entries()).map(([field, previousValue]) => ({
        field,
        previous: previousValue,
        updated: log.updatedValues.get(field)
      }))
    })).reverse(); // Reverse to show latest first
    
    console.log(`Found ${formattedLogs.length} update logs`);
    
    res.json({
      success: true,
      data: {
        eventTitle: event.title,
        logs: formattedLogs
      }
    });
    
  } catch (error) {
    console.error('Error fetching event logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event logs',
      error: error.message
    });
  }
});

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming/events', async (req, res) => {
  try {
    console.log('Fetching upcoming events...');
    
    const events = await Event.getUpcomingEvents();
    
    console.log(`Found ${events.length} upcoming events`);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
});

export default router;