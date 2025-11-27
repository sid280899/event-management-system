import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api';


// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const useEventStore = create((set, get) => ({
  // State
  profiles: [],
  events: [],
  selectedProfile: null,
  loading: false,
  error: null,
  
  // Actions
  setLoading: (loading) => set({ loading, error: loading ? null : get().error }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Profile actions
  fetchProfiles: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get('/profiles');
      
      if (response.data.success) {
        set({ 
          profiles: response.data.data,
          loading: false 
        });
        
        console.log('Profiles loaded successfully:', response.data.data.length);
      } else {
        throw new Error(response.data.message || 'Failed to fetch profiles');
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || error.message 
      });
    }
  },
  
  createProfile: async (name, timezone = 'UTC') => {
    try {
      set({ error: null });
      
      const response = await api.post('/profiles', { name, timezone });
      
      if (response.data.success) {
        const newProfile = response.data.data;
        
        set(state => ({ 
          profiles: [...state.profiles, newProfile] 
        }));
        
        console.log('Profile created successfully:', newProfile);
        return newProfile;
      } else {
        throw new Error(response.data.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  updateProfileTimezone: async (profileId, timezone) => {
    try {
      set({ error: null });
      
      const response = await api.put(`/profiles/${profileId}/timezone`, { timezone });
      
      if (response.data.success) {
        const updatedProfile = response.data.data;
        
        set(state => ({
          profiles: state.profiles.map(p => 
            p._id === profileId ? updatedProfile : p
          ),
          selectedProfile: state.selectedProfile?._id === profileId ? updatedProfile : state.selectedProfile
        }));
        
        console.log('Profile timezone updated successfully');
        return updatedProfile;
      } else {
        throw new Error(response.data.message || 'Failed to update timezone');
      }
    } catch (error) {
      console.error('Error in updateProfileTimezone:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  setSelectedProfile: (profile) => {
    set({ selectedProfile: profile });
    console.log('Selected profile:', profile?.name);
  },
  
  // Event actions
  fetchEvents: async (profileId = null) => {
    try {
      set({ loading: true, error: null });
      
      const url = profileId 
        ? `/events/profile/${profileId}`
        : '/events';
      
      const response = await api.get(url);
      
      if (response.data.success) {
        set({ 
          events: response.data.data,
          loading: false 
        });
        
        console.log('Events loaded successfully:', response.data.data.length);
      } else {
        throw new Error(response.data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || error.message 
      });
    }
  },
  
  createEvent: async (eventData) => {
    try {
      set({ error: null });
      
      const response = await api.post('/events', eventData);
      
      if (response.data.success) {
        const newEvent = response.data.data;
        
        set(state => ({ 
          events: [...state.events, newEvent] 
        }));
        
        console.log('Event created successfully:', newEvent);
        return newEvent;
      } else {
        throw new Error(response.data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error in createEvent:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  updateEvent: async (eventId, eventData) => {
    try {
      set({ error: null });
      
      const response = await api.put(`/events/${eventId}`, eventData);
      
      if (response.data.success) {
        const updatedEvent = response.data.data;
        
        set(state => ({
          events: state.events.map(event => 
            event._id === eventId ? updatedEvent : event
          )
        }));
        
        console.log('Event updated successfully:', updatedEvent);
        return updatedEvent;
      } else {
        throw new Error(response.data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error in updateEvent:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  fetchEventLogs: async (eventId) => {
    try {
      set({ error: null });
      
      const response = await api.get(`/events/${eventId}/logs`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch event logs');
      }
    } catch (error) {
      console.error('Error in fetchEventLogs:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  // Utility getters
  getProfileEvents: (profileId) => {
    const { events } = get();
    return events.filter(event => 
      event.profiles.some(profile => profile._id === profileId)
    );
  },
  
  getUpcomingEvents: () => {
    const { events } = get();
    const now = new Date();
    return events.filter(event => new Date(event.startDateTime) > now);
  }
}));