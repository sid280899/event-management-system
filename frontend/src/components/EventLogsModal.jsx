import React, { useState, useEffect } from 'react';
import { useEventStore } from '../stores/eventStore';
import { formatForDisplay } from '../utils/timezoneUtils';

const EventLogsModal = ({ event, onClose }) => {
  const {
    selectedProfile,
    fetchEventLogs,
    loading
  } = useEventStore();

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const logsData = await fetchEventLogs(event._id);
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error('Failed to load event logs:', error);
        alert('Failed to load event logs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [event._id]);

  const formatValue = (value, field) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (field === 'profiles' && Array.isArray(value)) {
      return value.join(', ');
    }

    if (field === 'startDateTime' || field === 'endDateTime') {
      return formatForDisplay(value, selectedProfile?.timezone || 'UTC');
    }

    return String(value);
  };

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      title: 'Event Title',
      description: 'Description',
      profiles: 'Assigned Profiles',
      timezone: 'Timezone',
      startDateTime: 'Start Time',
      endDateTime: 'End Time'
    };

    return fieldNames[field] || field;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal logs-modal" onClick={(e) => e.stopPropagation()}>
        <h3>📋 Update History</h3>
        <div className="event-info">
          <h4>{event.title}</h4>
          <p>Track all changes made to this event</p>
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Loading update history...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h4>No update history</h4>
            <p>This event hasn't been modified yet.</p>
            <p>Any changes will be logged here for audit purposes.</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={log.id || index} className="log-entry">
                <div className="log-header">
                  <div className="log-user">
                    <strong>👤 Updated by: {log.updatedBy?.name || 'Unknown User'}</strong>
                  </div>
                  <div className="log-timestamp">
                    {formatForDisplay(log.timestamp, selectedProfile?.timezone || 'UTC')}
                  </div>
                </div>

                <div className="log-changes">
                  {log.changes && log.changes.length > 0 ? (
                    log.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="change-item">
                        <span className="change-field">
                          {getFieldDisplayName(change.field)}:
                        </span>
                        <span className="change-previous">
                          {formatValue(change.previous, change.field)}
                        </span>
                        <span className="change-arrow">→</span>
                        <span className="change-updated">
                          {formatValue(change.updated, change.field)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-changes">
                      No specific changes recorded
                    </div>
                  )}
                </div>

                {/* Separator */}
                {index < logs.length - 1 && <hr className="log-separator" />}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Logs Info */}
        <div className="logs-info">
          <small className="text-muted">
            ℹ️ All event modifications are logged automatically with timestamps in your current timezone.
          </small>
        </div>
      </div>
    </div>
  );
};

export default EventLogsModal;