import axios from 'axios';

// Base API URL from the .env file
const API_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
    baseURL: API_URL, // Use the environment-specific URL
});

// Example of an interceptor (optional)
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
