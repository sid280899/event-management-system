import React, { useState, useEffect } from 'react';
import { useEventStore } from '../stores/eventStore';
import { 
  formatForDateTimeInput, 
  getTimezoneOffset 
} from '../utils/timezoneUtils';

const EventEditModal = ({ event, onClose }) => {
  const {
    profiles,
    selectedProfile,
    updateEvent,
    loading
  } = useEventStore();

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    profiles: event.profiles.map(p => p._id),
    timezone: event.timezone,
    startDateTime: '',
    endDateTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with event data
  useEffect(() => {
    setFormData({
      title: event.title,
      description: event.description || '',
      profiles: event.profiles.map(p => p._id),
      timezone: event.timezone,
      startDateTime: formatForDateTimeInput(event.startDateTime, event.timezone),
      endDateTime: formatForDateTimeInput(event.endDateTime, event.timezone)
    });
  }, [event]);

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

    if (startTime >= endTime) {
      alert('End time must be after start time');
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
      alert('Please select a profile to update events');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        updatedBy: selectedProfile._id
      };

      await updateEvent(event._id, updateData);
      onClose();
      alert('Event updated successfully! ✅');
    } catch (error) {
      console.error('Failed to update event:', error);
      alert(error.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    const original = {
      title: event.title,
      description: event.description || '',
      profiles: event.profiles.map(p => p._id).sort(),
      timezone: event.timezone,
      startDateTime: formatForDateTimeInput(event.startDateTime, event.timezone),
      endDateTime: formatForDateTimeInput(event.endDateTime, event.timezone)
    };

    const current = {
      ...formData,
      profiles: [...formData.profiles].sort()
    };

    return JSON.stringify(original) !== JSON.stringify(current);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>✏️ Edit Event</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="form-group">
            <label htmlFor="editTitle">Event Title *</label>
            <input
              type="text"
              id="editTitle"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Event Description */}
          <div className="form-group">
            <label htmlFor="editDescription">Description</label>
            <textarea
              id="editDescription"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Assigned Profiles */}
          <div className="form-group">
            <label>Assign to Profiles *</label>
            <div className="profiles-checkbox">
              {profiles.map((profile) => (
                <label key={profile._id}>
                  <input
                    type="checkbox"
                    checked={formData.profiles.includes(profile._id)}
                    onChange={() => handleProfileToggle(profile._id)}
                    disabled={isSubmitting}
                  />
                  <span>
                    <strong>{profile.name}</strong>
                    <small> ({profile.timezone})</small>
                  </span>
                </label>
              ))}
            </div>
            <small className="text-muted">
              Selected: {formData.profiles.length} profiles
            </small>
          </div>

          {/* Event Timezone */}
          <div className="form-group">
            <label htmlFor="editTimezone">Event Timezone *</label>
            <select
              id="editTimezone"
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
          </div>

          {/* Start Date & Time */}
          <div className="form-group">
            <label htmlFor="editStartDateTime">Start Date & Time *</label>
            <input
              type="datetime-local"
              id="editStartDateTime"
              value={formData.startDateTime}
              onChange={(e) => handleInputChange('startDateTime', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* End Date & Time */}
          <div className="form-group">
            <label htmlFor="editEndDateTime">End Date & Time *</label>
            <input
              type="datetime-local"
              id="editEndDateTime"
              value={formData.endDateTime}
              onChange={(e) => handleInputChange('endDateTime', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Change Summary */}
          {hasChanges() && (
            <div className="changes-summary">
              <h4>Changes to be saved:</h4>
              <ul>
                {formData.title !== event.title && (
                  <li>
                    <strong>Title:</strong> "{event.title}" → "{formData.title}"
                  </li>
                )}
                {formData.description !== event.description && (
                  <li>
                    <strong>Description:</strong> Updated
                  </li>
                )}
                {JSON.stringify([...formData.profiles].sort()) !== JSON.stringify(event.profiles.map(p => p._id).sort()) && (
                  <li>
                    <strong>Assigned profiles:</strong> Changed
                  </li>
                )}
                {formData.timezone !== event.timezone && (
                  <li>
                    <strong>Timezone:</strong> {event.timezone} → {formData.timezone}
                  </li>
                )}
                {formData.startDateTime !== formatForDateTimeInput(event.startDateTime, event.timezone) && (
                  <li>
                    <strong>Start time:</strong> Updated
                  </li>
                )}
                {formData.endDateTime !== formatForDateTimeInput(event.endDateTime, event.timezone) && (
                  <li>
                    <strong>End time:</strong> Updated
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !hasChanges()}
            >
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventEditModal;