/**
 * Format a date string to a human-readable format.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a max length and add ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Get stored auth token from localStorage.
 * @returns {string|null}
 */
export const getToken = () => localStorage.getItem('travelmate-token');

/**
 * Save auth token to localStorage.
 * @param {string} token
 */
export const setToken = (token) => localStorage.setItem('travelmate-token', token);

/**
 * Remove auth token from localStorage.
 */
export const removeToken = () => localStorage.removeItem('travelmate-token');
