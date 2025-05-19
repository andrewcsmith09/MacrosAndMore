import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import navigationService from './navigationService';

axios.defaults.baseURL = 'https://ec2.andrewsmithdevelopment.com';

// Function to set access token
const setAccessToken = async (token) => {
  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.error('Error setting access token:', error);
  }
};

// Function to get access token
const getAccessToken = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
};

// Function to set refresh token
const setRefreshToken = async (token) => {
  try {
    await SecureStore.setItemAsync('refreshToken', token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

// Function to get refresh token
const getRefreshToken = async () => {
  try {
    const credentials = await SecureStore.getItemAsync('refreshToken');
    const refreshToken = credentials ? credentials : null;
    return refreshToken;
  } catch (error) {
    console.error('Error fetching refresh token:', error);
    return null;
  }
};

// Function to clear tokens
const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Endpoints that don't require authorization
const publicEndpoints = [
  '/api/users/login',
  '/api/users/register',
  '/api/auth/refresh',
  '/api/verify-email',
  '/api/resend-verification',
  '/api/forgot-password',
  '/api/reset-password'
];

// Timer state and last refresh time
let isRefreshing = false;
let lastRefreshTime = 0;

// Function to refresh access token
const refreshAccessTokenIfNeeded = async (url) => {
  const now = Date.now();
  // Skip refresh if it's in progress or within 10 minutes since last refresh
  if (isRefreshing || now - lastRefreshTime < 10 * 1000) { 
    return;
  }
  
  // Skip refresh if the URL matches a public endpoint
  if (publicEndpoints.some(endpoint => url.includes(endpoint))) {
    return;
  }

  isRefreshing = true;
  try {
    const refreshToken = await getRefreshToken();    
    if (refreshToken) {
      // Send request to refresh token
      const response = await axios.post('/api/auth/refresh', { refreshToken });      
      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken; // Extract new refresh token
      
      await setAccessToken(newAccessToken); // Save new access token
      await setRefreshToken(newRefreshToken); // Save new refresh token
      lastRefreshTime = Date.now(); // Update last refresh time
    } else {
      throw new Error('No refresh token available');
    }
  } catch (error) {
    console.error('Error during token refresh:', error);
    await clearTokens();
    Alert.alert('Session Expired', 'Please log in again.');
    navigationService.navigate('Login');
  } finally {
    isRefreshing = false;
  }
};

// Create Axios instance with interceptors
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async (config) => {
    await refreshAccessTokenIfNeeded(config.url); // Refresh token if needed before request
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle specific error statuses
    if (error.response) {
      const status = error.response.status;

      if ((status === 404 || status === 403) && error?.response?.data !== "Please verify your email before " +
       "logging in." && error?.request?.responseURL !== "https://ec2.andrewsmithdevelopment.com/api/forgot-password") {
        
        await clearTokens();
        Alert.alert('Session Expired', 'Please log in again.');
        navigationService.navigate('Login');
      } 
    } else if (error.request) {
      // Network or server issue
      console.error('Network error:', error.request);
      Alert.alert('Network Error', 'Unable to reach the server. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;