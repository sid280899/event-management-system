import React, { useState } from 'react';
import { useEventStore } from '../stores/eventStore';
import { formatForDisplay, getTimezoneOffset } from '../utils/timezoneUtils';
import EventEditModal from './EventEditModal';
import EventLogsModal from './EventLogsModal';

const EventList = () => {
  const {
    events,
    selectedProfile,
    loading,
    getProfileEvents
  } = useEventStore();

  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingLogsEvent, setViewingLogsEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  // Get events based on selected profile and filter
  const displayedEvents = selectedProfile 
    ? getProfileEvents(selectedProfile._id)
    : events;

  const filteredEvents = displayedEvents.filter(event => {
    const now = new Date();
    const eventStart = new Date(event.startDateTime);
    const eventEnd = new Date(event.endDateTime);

    switch (filter) {
      case 'upcoming':
        return eventStart > now;
      case 'past':
        return eventEnd < now;
      case 'ongoing':
        return eventStart <= now && eventEnd >= now;
      case 'all':
      default:
        return true;
    }
  });

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (now < start) {
      return { status: 'upcoming', label: 'Upcoming', color: '#3498db' };
    } else if (now >= start && now <= end) {
      return { status: 'ongoing', label: 'Ongoing', color: '#27ae60' };
    } else {
      return { status: 'past', label: 'Completed', color: '#95a5a6' };
    }
  };

  const getEventDuration = (event) => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="event-list">
        <h3>📅 Events</h3>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="event-list">
      <div className="event-list-header">
        <h3>📅 Events</h3>
        
        {selectedProfile && (
          <div className="viewing-info">
            Viewing events for: <strong>{selectedProfile.name}</strong>
            <span className="timezone-badge">
              {selectedProfile.timezone} ({getTimezoneOffset(selectedProfile.timezone)})
            </span>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="event-filters">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Events ({displayedEvents.length})
          </button>
          <button
            className={filter === 'upcoming' ? 'active' : ''}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({displayedEvents.filter(e => new Date(e.startDateTime) > new Date()).length})
          </button>
          <button
            className={filter === 'ongoing' ? 'active' : ''}
            onClick={() => setFilter('ongoing')}
          >
            Ongoing ({displayedEvents.filter(e => 
              new Date(e.startDateTime) <= new Date() && new Date(e.endDateTime) >= new Date()
            ).length})
          </button>
          <button
            className={filter === 'past' ? 'active' : ''}
            onClick={() => setFilter('past')}
          >
            Completed ({displayedEvents.filter(e => new Date(e.endDateTime) < new Date()).length})
          </button>
        </div>

        <div className="events-count">
          Showing {filteredEvents.length} of {displayedEvents.length} events
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          {displayedEvents.length === 0 ? (
            <>
              <h4>No events found</h4>
              <p>Create your first event using the form above!</p>
            </>
          ) : (
            <>
              <h4>No events match the current filter</h4>
              <p>Try selecting a different filter or create new events.</p>
            </>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const duration = getEventDuration(event);
            
            return (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <div className="event-title-section">
                    <h4 className="event-title">{event.title}</h4>
                    <span 
                      className="event-status-badge"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="event-actions">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="btn-edit"
                      title="Edit event"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setViewingLogsEvent(event)}
                      className="btn-logs"
                      title="View update history"
                    >
                      📋 Logs
                    </button>
                  </div>
                </div>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-details">
                  <div className="event-detail-item">
                    <span className="detail-label">👥 Assigned to:</span>
                    <span className="detail-value">
                      {event.profiles.map(p => p.name).join(', ')}
                    </span>
                  </div>

                  <div className="event-detail-item">
                    <span className="detail-label">🌐 Event Timezone:</span>
                    <span className="detail-value">
                      {event.timezone} ({getTimezoneOffset(event.timezone)})
                    </span>
                  </div>

                  <div className="event-detail-item">
                    <span className="detail-label">🕐 Start:</span>
                    <span className="detail-value">
                      {formatForDisplay(event.startDateTime, selectedProfile?.timezone || 'UTC')}
                    </span>
                  </div>

                  <div className="event-detail-item">
                    <span className="detail-label">🕔 End:</span>
                    <span className="detail-value">
                      {formatForDisplay(event.endDateTime, selectedProfile?.timezone || 'UTC')}
                    </span>
                  </div>

                  <div className="event-detail-item">
                    <span className="detail-label">⏱️ Duration:</span>
                    <span className="detail-value">{duration}</span>
                  </div>

                  <div className="event-detail-item">
                    <span className="detail-label">👤 Created by:</span>
                    <span className="detail-value">{event.createdBy?.name || 'Unknown'}</span>
                  </div>

                  {event.updatedAt && (
                    <div className="event-detail-item">
                      <span className="detail-label">🔄 Last updated:</span>
                      <span className="detail-value">
                        {formatForDisplay(event.updatedAt, selectedProfile?.timezone || 'UTC')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timezone Comparison */}
                {selectedProfile && event.timezone !== selectedProfile.timezone && (
                  <div className="timezone-comparison">
                    <small>
                      <strong>Note:</strong> This event was scheduled in {event.timezone} timezone.
                      Times shown are converted to your current timezone ({selectedProfile.timezone}).
                    </small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {viewingLogsEvent && (
        <EventLogsModal
          event={viewingLogsEvent}
          onClose={() => setViewingLogsEvent(null)}
        />
      )}
    </div>
  );
};

export default EventList;