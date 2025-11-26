import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Common timezones for the application
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
 * Format a date in the specified timezone
 * @param {Date|string} date - Date to format
 * @param {string} timezone - Target timezone
 * @param {string} format - Dayjs format string
 * @returns {string} Formatted date string
 */
export const formatInTimezone = (date, timezone, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return 'N/A';
  try {
    return dayjs(date).tz(timezone).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format for datetime-local input
 * @param {Date|string} date - Date to format
 * @param {string} timezone - Target timezone
 * @returns {string} Formatted string for input[type="datetime-local"]
 */
export const formatForDateTimeInput = (date, timezone) => {
  return formatInTimezone(date, timezone, 'YYYY-MM-DDTHH:mm');
};

/**
 * Format for display with date and time
 * @param {Date|string} date - Date to format
 * @param {string} timezone - Target timezone
 * @returns {string} Human readable date time
 */
export const formatForDisplay = (date, timezone) => {
  return formatInTimezone(date, timezone, 'MMM D, YYYY [at] h:mm A');
};

/**
 * Get current date-time in specific timezone for input
 * @param {string} timezone - Target timezone
 * @returns {string} Formatted current datetime
 */
export const getCurrentDateTimeForInput = (timezone) => {
  return dayjs().tz(timezone).format('YYYY-MM-DDTHH:mm');
};

/**
 * Get a future date (default 1 hour from now) for input
 * @param {string} timezone - Target timezone
 * @param {number} hours - Hours to add
 * @returns {string} Formatted future datetime
 */
export const getFutureDateTimeForInput = (timezone, hours = 1) => {
  return dayjs().tz(timezone).add(hours, 'hour').format('YYYY-MM-DDTHH:mm');
};

/**
 * Check if a timezone is valid
 * @param {string} timezone - Timezone to check
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
 * Convert date between timezones
 * @param {Date|string} date - Date to convert
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {Date} Converted date
 */
export const convertBetweenTimezones = (date, fromTimezone, toTimezone) => {
  return dayjs.tz(date, fromTimezone).tz(toTimezone).toDate();
};

/**
 * Get timezone offset string
 * @param {string} timezone - Timezone
 * @returns {string} Offset string like UTC-5
 */
export const getTimezoneOffset = (timezone) => {
  try {
    const offset = dayjs().tz(timezone).utcOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset >= 0 ? '+' : '-';
    
    if (minutes === 0) {
      return `UTC${sign}${hours}`;
    }
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return 'UTC';
  }
};