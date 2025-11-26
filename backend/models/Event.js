import mongoose from 'mongoose';
import dayjs from 'dayjs';

const eventUpdateLogSchema = new mongoose.Schema({
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  previousValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  updatedValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  timezone: {
    type: String,
    required: [true, 'Event timezone is required'],
    default: 'UTC'
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  updateLogs: [eventUpdateLogSchema]
}, {
  timestamps: true
});


eventSchema.pre('save', function(next) {
  if (this.endDateTime <= this.startDateTime) {
    const error = new Error('End date/time must be after start date/time');
    return next(error);
  }
  

  if (this.endDateTime < new Date()) {
    const error = new Error('End date/time cannot be in the past');
    return next(error);
  }
  
  next();
});


eventSchema.statics.findByProfile = function(profileId) {
  return this.find({ profiles: profileId })
    .populate('profiles', 'name timezone')
    .populate('createdBy', 'name')
    .sort({ startDateTime: 1 });
};


eventSchema.statics.getUpcomingEvents = function() {
  return this.find({ 
    startDateTime: { $gte: new Date() } 
  })
  .populate('profiles', 'name timezone')
  .sort({ startDateTime: 1 });
};


eventSchema.methods.isOngoing = function() {
  const now = new Date();
  return now >= this.startDateTime && now <= this.endDateTime;
};


eventSchema.methods.getDurationHours = function() {
  const durationMs = this.endDateTime - this.startDateTime;
  return Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;