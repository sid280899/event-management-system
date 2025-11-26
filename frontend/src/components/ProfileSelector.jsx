import React from 'react';
import { useEventStore } from '../stores/eventStore';
import { getTimezoneOffset } from '../utils/timezoneUtils';

const ProfileSelector = () => {
  const {
    profiles,
    selectedProfile,
    setSelectedProfile,
    updateProfileTimezone
  } = useEventStore();

  const handleProfileSelect = (profile) => {
    console.log('Selecting profile:', profile.name);
    setSelectedProfile(profile);
  };

  const handleTimezoneChange = async (event, profile) => {
    const newTimezone = event.target.value;
    console.log(`Changing timezone for ${profile.name} to ${newTimezone}`);
    
    try {
      await updateProfileTimezone(profile._id, newTimezone);
      // If this is the selected profile, update it in the state
      if (selectedProfile && selectedProfile._id === profile._id) {
        setSelectedProfile({ ...profile, timezone: newTimezone });
      }
    } catch (error) {
      console.error('Failed to update timezone:', error);
      alert('Failed to update timezone. Please try again.');
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="profile-selector">
        <h3>👥 Profiles</h3>
        <div className="empty-state">
          <p>No profiles created yet.</p>
          <p>Go to "Manage Profiles" to create your first profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <h3>👥 Select Profile</h3>
      <p className="text-muted mb-2">Choose a profile to view events in their timezone</p>
      
      <div className="profiles-grid">
        {profiles.map((profile) => (
          <div
            key={profile._id}
            className={`profile-card ${selectedProfile?._id === profile._id ? 'active' : ''}`}
            onClick={() => handleProfileSelect(profile)}
          >
            <button className="profile-name">
              {profile.name}
            </button>
            
            <div className="profile-timezone">
              <select
                value={profile.timezone}
                onChange={(e) => handleTimezoneChange(e, profile)}
                onClick={(e) => e.stopPropagation()}
                className="timezone-select"
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

            {selectedProfile?._id === profile._id && (
              <div className="profile-active-indicator">
                <span>✅ Currently viewing</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div className="current-selection mt-2">
          <p>
            <strong>Viewing events in:</strong> {selectedProfile.timezone} ({getTimezoneOffset(selectedProfile.timezone)})
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;