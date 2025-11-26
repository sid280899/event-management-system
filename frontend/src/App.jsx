import React, { useEffect, useState } from 'react';
import { useEventStore } from './stores/eventStore';
import ProfileManager from './components/ProfileManager';
import ProfileSelector from './components/ProfileSelector';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import './App.css';

function App() {
  const {
    profiles,
    selectedProfile,
    loading,
    error,
    fetchProfiles,
    fetchEvents,
    setSelectedProfile,
    clearError
  } = useEventStore();

  const [activeTab, setActiveTab] = useState('events');

  // Load profiles on app start
  useEffect(() => {
    console.log('App started - loading profiles...');
    fetchProfiles();
  }, []);

  // Load events when selected profile changes
  useEffect(() => {
    if (selectedProfile) {
      console.log('Profile selected, loading events...');
      fetchEvents(selectedProfile._id);
    } else {
      fetchEvents();
    }
  }, [selectedProfile]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🎯 Event Management System</h1>
          <p>Manage events across multiple timezones</p>
        </div>
        
        {selectedProfile && (
          <div className="current-profile">
            <span>Viewing as: </span>
            <strong>{selectedProfile.name}</strong>
            <span> ({selectedProfile.timezone})</span>
          </div>
        )}
      </header>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {/* Profile Selection Sidebar */}
        <aside className="app-sidebar">
          <ProfileSelector />
        </aside>

        {/* Main Content Area */}
        <div className="app-content">
          {/* Navigation Tabs */}
          <nav className="app-tabs">
            <button 
              className={activeTab === 'events' ? 'active' : ''}
              onClick={() => setActiveTab('events')}
            >
              📅 Events
            </button>
            <button 
              className={activeTab === 'profiles' ? 'active' : ''}
              onClick={() => setActiveTab('profiles')}
            >
              👥 Manage Profiles
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'events' && (
              <div className="events-tab">
                <EventForm />
                <EventList />
              </div>
            )}

            {activeTab === 'profiles' && (
              <div className="profiles-tab">
                <ProfileManager />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Event Management System &copy; 2024</p>
      </footer>
    </div>
  );
}

export default App;