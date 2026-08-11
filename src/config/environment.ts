/**
 * Central place for the development server address.
 *
 * Android emulators usually reach the host through 10.0.2.2. On a physical
 * device, use your computer's LAN address instead. This is deliberately kept
 * out of API and socket modules so production configuration has one boundary.
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const SERVER_URL = getBaseUrl();

export const API_URL = `${SERVER_URL}/api`;
