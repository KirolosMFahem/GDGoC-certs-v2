// Configuration constants for the application

// Hostnames
export const HOSTNAMES = {
  ADMIN: import.meta.env.VITE_ADMIN_HOSTNAME || 'sudo.certs-admin.certs.gdg-oncampus.dev',
  PUBLIC: import.meta.env.VITE_PUBLIC_HOSTNAME || 'certs.gdg-oncampus.dev',
  DEV: 'localhost'
};

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Environment
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

export default {
  HOSTNAMES,
  API_URL,
  isDevelopment,
  isProduction
};
