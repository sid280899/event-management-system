import React, { useState } from 'react';
import { useEventStore } from '../stores/eventStore';

const ProfileManager = () => {
  const {
    profiles,
    loading,
    createProfile,
    fetchProfiles
  } = useEventStore();

  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileTimezone, setNewProfileTimezone] = useState('UTC');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!newProfileName.trim()) {
      alert('Please enter a profile name');
      return;
    }

    if (newProfileName.trim().length < 2) {
      alert('Profile name must be at least 2 characters long');
      return;
    }

    setIsCreating(true);

    try {
      await createProfile(newProfileName.trim(), newProfileTimezone);
      setNewProfileName('');
      setNewProfileTimezone('UTC');
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchProfiles();
    } catch (error) {
      console.error('Failed to refresh profiles:', error);
      alert('Failed to refresh profiles.');
    }
  };

  return (
    <div className="profile-manager">
      <h3>👥 Manage Profiles</h3>
      
      {/* Create Profile Form */}
      <div className="create-profile-form">
        <h4>Create New Profile</h4>
        <form onSubmit={handleCreateProfile}>
          <div className="form-group">
            <label htmlFor="profileName">Profile Name *</label>
            <input
              type="text"
              id="profileName"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter profile name (e.g., John Doe)"
              disabled={isCreating}
              required
              minLength={2}
              maxLength={50}
            />
            <small className="text-muted">
              Required. 2-50 characters.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="profileTimezone">Default Timezone</label>
            <select
              id="profileTimezone"
              value={newProfileTimezone}
              onChange={(e) => setNewProfileTimezone(e.target.value)}
              disabled={isCreating}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Chicago">Chicago (CST/CDT)</option>
              <option value="America/Denver">Denver (MST/MDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
              <option value="Europe/Berlin">Berlin (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Kolkata">Kolkata (IST)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            </select>
            <small className="text-muted">
              Users can change their timezone later
            </small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating || !newProfileName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh List
            </button>
          </div>
        </form>
      </div>

      {/* Profiles List */}
      <div className="profiles-list-section">
        <h4>Existing Profiles ({profiles.length})</h4>
        
        {profiles.length === 0 ? (
          <div className="empty-state">
            <p>No profiles yet. Create your first profile above!</p>
          </div>
        ) : (
          <div className="profiles-list">
            {profiles.map((profile) => (
              <div key={profile._id} className="profile-item">
                <div className="profile-info">
                  <h4>{profile.name}</h4>
                  <div className="profile-timezone">
                    <strong>Timezone:</strong> {profile.timezone}
                  </div>
                  <div className="profile-meta">
                    <small>Created: {new Date(profile.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
                
                <div className="profile-status">
                  {profile.isActive ? (
                    <span className="status-active">✅ Active</span>
                  ) : (
                    <span className="status-inactive">❌ Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions mt-3">
        <h5>How to use profiles:</h5>
        <ul>
          <li>Create profiles for different users or teams</li>
          <li>Each profile can have its own timezone</li>
          <li>Switch between profiles to view events in different timezones</li>
          <li>Events will automatically convert to the selected profile's timezone</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileManager;