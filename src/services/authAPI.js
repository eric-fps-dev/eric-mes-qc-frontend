import axios from "axios";
import config from './config';
import {gotoCognitoLogin} from "@/utils/cognito";

const api = axios.create({
    baseURL: config.USER_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const WHITELIST_URLS = [
    '/auth/callback',
    '/auth/refresh',
    '/auth/logout'
];


api.interceptors.request.use(
    (config) => {
        const isWhitelisted = WHITELIST_URLS.some(url => config.url.includes(url));
        if (isWhitelisted) {
            console.log(`Request to auth whitelist: ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async (error) =>  {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !WHITELIST_URLS.some(url => originalRequest.url.includes(url))
        ) {
            originalRequest._retry = true;
            try {
                await api.post('/auth/refresh')
                return api(originalRequest);
            } catch (refreshErr) {
                gotoCognitoLogin();
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(error)
    }
)

export default api;
