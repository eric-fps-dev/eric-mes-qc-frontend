import axios from 'axios'
import { refresh } from "@/services/userService";
import { gotoCognitoLogin } from "@/utils/cognito";
import { willExpireSoon } from "@/utils/jwt";
import { ElMessage } from "element-plus";

const QC_API_URL = import.meta.env.VITE_API_URL
const TOKEN_SKEW_SECONDS = 120
const REFRESH_URLS = ['/auth/refresh', '/auth/callback', '/auth/logout']
let isRefreshing = false
let refreshPromise = null
const refreshQueue = []

function getAccessToken() {
    return localStorage.getItem('access_token')
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token')
}

function isAuthWhitelisted(url = '') {
    return REFRESH_URLS.some(p => url.includes(p))
}

async function doRefreshOnce() {
    if (isRefreshing) return refreshPromise
    const rt = getRefreshToken()
    if (!rt) throw new Error('No refresh token')

    isRefreshing = true
    refreshPromise = refresh()
        .then(() => {
            const at = getAccessToken()
            refreshQueue.splice(0).forEach(cb => cb(at))
        })
        .finally(() => {
            isRefreshing = false
            refreshPromise = null
        })

    return refreshPromise
}

const api = axios.create({
    baseURL: QC_API_URL,
    timeout: 60_000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// --------------------
// Request interceptor
// --------------------
api.interceptors.request.use(
    async config => {
        if (!isAuthWhitelisted(config.url)) {
            const token = getAccessToken()
            if (token && willExpireSoon(token, TOKEN_SKEW_SECONDS)) {
                await doRefreshOnce()
            }
            config.headers.Authorization = `Bearer ${getAccessToken()}`
        }
        return config
    },
    error => Promise.reject(error)
)

// --------------------
// Response interceptor
// --------------------
api.interceptors.response.use(
    response => response,
    async error => {
        if (error?.response?.status === 401) {
            try {
                await doRefreshOnce()
                error.config.headers.Authorization = `Bearer ${getAccessToken()}`
                return error.config
            } catch {
                gotoCognitoLogin()
            }
        }
        ElMessage.error(error.message || 'Request failed')
        return Promise.reject(error)
    }
)

export default api
