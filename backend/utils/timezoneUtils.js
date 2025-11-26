import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// List of common timezones
export const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney'
];

/**
 * Format date for display in specific timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - The target timezone
 * @param {string} format - Dayjs format string
 * @returns {string} Formatted date string
 */
export const formatInTimezone = (date, timezone, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return 'N/A';
  return dayjs(date).tz(timezone).format(format);
};

/**
 * Convert date from one timezone to another
 * @param {Date} date - The date to convert
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {Date} Converted date
 */
export const convertTimezone = (date, fromTimezone, toTimezone) => {
  return dayjs.tz(date, fromTimezone).tz(toTimezone).toDate();
};

/**
 * Get current date-time in specific timezone
 * @param {string} timezone - The timezone
 * @returns {string} ISO string in the specified timezone
 */
export const getCurrentDateTimeForTimezone = (timezone) => {
  return dayjs().tz(timezone).format('YYYY-MM-DDTHH:mm');
};

/**
 * Validate if a timezone string is valid
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} True if valid
 */
export const isValidTimezone = (timezone) => {
  try {
    dayjs().tz(timezone);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculate event times for different timezones
 * @param {Date} date - The date
 * @param {string} originalTimezone - Original timezone of the date
 * @param {Array} targetTimezones - Array of target timezones
 * @returns {Object} Object with formatted times for each timezone
 */
export const getTimesForTimezones = (date, originalTimezone, targetTimezones) => {
  const result = {};
  
  targetTimezones.forEach(tz => {
    result[tz] = formatInTimezone(date, tz, 'YYYY-MM-DD HH:mm');
  });
  
  return result;
};