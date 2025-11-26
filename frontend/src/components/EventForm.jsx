import React, { useState, useEffect } from 'react';
import { useEventStore } from '../stores/eventStore';
import { 
  getCurrentDateTimeForInput, 
  getFutureDateTimeForInput,
  getTimezoneOffset 
} from '../utils/timezoneUtils';

const EventForm = () => {
  const {
    profiles,
    selectedProfile,
    createEvent,
    loading
  } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profiles: [],
    timezone: 'UTC',
    startDateTime: '',
    endDateTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with current profile's timezone
  useEffect(() => {
    if (selectedProfile) {
      const currentTime = getCurrentDateTimeForInput(selectedProfile.timezone);
      const futureTime = getFutureDateTimeForInput(selectedProfile.timezone, 1);
      
      setFormData(prev => ({
        ...prev,
        timezone: selectedProfile.timezone,
        startDateTime: currentTime,
        endDateTime: futureTime,
        profiles: [selectedProfile._id]
      }));
    } else if (profiles.length > 0) {
      // If no profile selected but profiles exist, use first profile's timezone
      const firstProfile = profiles[0];
      const currentTime = getCurrentDateTimeForInput(firstProfile.timezone);
      const futureTime = getFutureDateTimeForInput(firstProfile.timezone, 1);
      
      setFormData(prev => ({
        ...prev,
        timezone: firstProfile.timezone,
        startDateTime: currentTime,
        endDateTime: futureTime
      }));
    }
  }, [selectedProfile, profiles]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileToggle = (profileId) => {
    setFormData(prev => {
      const currentProfiles = prev.profiles.includes(profileId)
        ? prev.profiles.filter(id => id !== profileId)
        : [...prev.profiles, profileId];
      
      return {
        ...prev,
        profiles: currentProfiles
      };
    });
  };

  const handleSelectAllProfiles = () => {
    const allProfileIds = profiles.map(profile => profile._id);
    setFormData(prev => ({
      ...prev,
      profiles: allProfileIds
    }));
  };

  const handleDeselectAllProfiles = () => {
    setFormData(prev => ({
      ...prev,
      profiles: []
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return false;
    }

    if (formData.profiles.length === 0) {
      alert('Please select at least one profile for the event');
      return false;
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      alert('Please select both start and end times');
      return false;
    }

    const startTime = new Date(formData.startDateTime);
    const endTime = new Date(formData.endDateTime);
    const now = new Date();

    if (startTime >= endTime) {
      alert('End time must be after start time');
      return false;
    }

    if (endTime < now) {
      alert('End time cannot be in the past');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedProfile) {
      alert('Please select a profile first to create events');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        createdBy: selectedProfile._id
      };

      await createEvent(eventData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        profiles: [selectedProfile._id],
        timezone: selectedProfile.timezone,
        startDateTime: getCurrentDateTimeForInput(selectedProfile.timezone),
        endDateTime: getFutureDateTimeForInput(selectedProfile.timezone, 1)
      });

      alert('Event created successfully! 🎉');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="event-form">
        <h3>📅 Create New Event</h3>
        <div className="empty-state">
          <p>No profiles available.</p>
          <p>Please create a profile first to start creating events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form">
      <h3>📅 Create New Event</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Event Title */}
        <div className="form-group">
          <label htmlFor="eventTitle">Event Title *</label>
          <input
            type="text"
            id="eventTitle"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter event title (e.g., Team Meeting, Project Review)"
            disabled={isSubmitting}
            required
            minLength={2}
            maxLength={100}
          />
          <small className="text-muted">
            Required. 2-100 characters.
          </small>
        </div>

        {/* Event Description */}
        <div className="form-group">
          <label htmlFor="eventDescription">Description</label>
          <textarea
            id="eventDescription"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the event (optional)"
            disabled={isSubmitting}
            rows={3}
            maxLength={500}
          />
          <small className="text-muted">
            Optional. {formData.description.length}/500 characters.
          </small>
        </div>

        {/* Assigned Profiles */}
        <div className="form-group">
          <label>
            Assign to Profiles *
            <div className="profile-selection-actions">
              <button
                type="button"
                onClick={handleSelectAllProfiles}
                className="btn-link"
              >
                Select All
              </button>
              <span> | </span>
              <button
                type="button"
                onClick={handleDeselectAllProfiles}
                className="btn-link"
              >
                Deselect All
              </button>
            </div>
          </label>
          
          <div className="profiles-checkbox">
            {profiles.map((profile) => (
              <label key={profile._id} htmlFor={`profile-${profile._id}`}>
                <input
                  type="checkbox"
                  id={`profile-${profile._id}`}
                  checked={formData.profiles.includes(profile._id)}
                  onChange={() => handleProfileToggle(profile._id)}
                  disabled={isSubmitting}
                />
                <span className="profile-checkbox-info">
                  <strong>{profile.name}</strong>
                  <small> ({profile.timezone})</small>
                </span>
              </label>
            ))}
          </div>
          
          <small className="text-muted">
            Selected: {formData.profiles.length} of {profiles.length} profiles
          </small>
        </div>

        {/* Event Timezone */}
        <div className="form-group">
          <label htmlFor="eventTimezone">Event Timezone *</label>
          <select
            id="eventTimezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="UTC">UTC ({getTimezoneOffset('UTC')})</option>
            <option value="America/New_York">New York ({getTimezoneOffset('America/New_York')})</option>
            <option value="America/Chicago">Chicago ({getTimezoneOffset('America/Chicago')})</option>
            <option value="America/Denver">Denver ({getTimezoneOffset('America/Denver')})</option>
            <option value="America/Los_Angeles">Los Angeles ({getTimezoneOffset('America/Los_Angeles')})</option>
            <option value="Europe/London">London ({getTimezoneOffset('Europe/London')})</option>
            <option value="Europe/Paris">Paris ({getTimezoneOffset('Europe/Paris')})</option>
            <option value="Europe/Berlin">Berlin ({getTimezoneOffset('Europe/Berlin')})</option>
            <option value="Asia/Tokyo">Tokyo ({getTimezoneOffset('Asia/Tokyo')})</option>
            <option value="Asia/Kolkata">Kolkata ({getTimezoneOffset('Asia/Kolkata')})</option>
            <option value="Asia/Singapore">Singapore ({getTimezoneOffset('Asia/Singapore')})</option>
            <option value="Australia/Sydney">Sydney ({getTimezoneOffset('Australia/Sydney')})</option>
          </select>
          <small className="text-muted">
            Timezone for the event schedule
          </small>
        </div>

        {/* Start Date & Time */}
        <div className="form-group">
          <label htmlFor="startDateTime">Start Date & Time *</label>
          <input
            type="datetime-local"
            id="startDateTime"
            value={formData.startDateTime}
            onChange={(e) => handleInputChange('startDateTime', e.target.value)}
            disabled={isSubmitting}
            required
          />
          <small className="text-muted">
            Event start time in {formData.timezone} timezone
          </small>
        </div>

        {/* End Date & Time */}
        <div className="form-group">
          <label htmlFor="endDateTime">End Date & Time *</label>
          <input
            type="datetime-local"
            id="endDateTime"
            value={formData.endDateTime}
            onChange={(e) => handleInputChange('endDateTime', e.target.value)}
            disabled={isSubmitting}
            required
          />
          <small className="text-muted">
            Event end time in {formData.timezone} timezone
          </small>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (selectedProfile) {
                setFormData({
                  title: '',
                  description: '',
                  profiles: [selectedProfile._id],
                  timezone: selectedProfile.timezone,
                  startDateTime: getCurrentDateTimeForInput(selectedProfile.timezone),
                  endDateTime: getFutureDateTimeForInput(selectedProfile.timezone, 1)
                });
              }
            }}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>
      </form>

      {/* Form Help */}
      <div className="form-help mt-2">
        <h5>Tips:</h5>
        <ul>
          <li>Events will be automatically converted to each user's timezone</li>
          <li>You can assign events to multiple users at once</li>
          <li>All users can view and update events assigned to them</li>
          <li>Time changes are logged for audit purposes</li>
        </ul>
      </div>
    </div>
  );
};

export default EventForm;