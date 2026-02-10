import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import { gotoCognitoLogin } from '@/utils/cognito'

let reqSeq = 0

function nextReqId() {
    reqSeq += 1
    return `r${reqSeq}`
}

/**
 * Base URLs
 * - QC uses ENV_UTILS.getApiBaseUrl() => usually "/api" in dev (Vite proxy), real URL in prod
 * - User client should be a dev proxy prefix like "/user-api" (avoid CORS)
 */
const QC_API_URL =
    import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_QC_PROXY_PREFIX || '/proxy/qc'
        : (import.meta.env.VITE_BACKEND_URL || '')

const USER_API_URL =
    import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_USER_PROXY_PREFIX || '/proxy/user'
        : (import.meta.env.VITE_USER_CLIENT_URL || '')

// --------------------
// Constants
// --------------------
const TOKEN_KEYS = ['access_token', 'refresh_token']
const WHITE_LIST = ['/callback', '/logout-success', '/refresh']

// These are auth endpoints that should NOT attach access token automatically
const AUTH_ENDPOINTS = ['/auth/refresh', '/auth/callback', '/auth/logout']
const WHITELIST_URLS = WHITE_LIST.map(p => `/auth${p}`)

// --------------------
// State
// --------------------
let isRefreshing = false
let isLoggingOut = false
let refreshPromise = null
const refreshQueue = []

// --------------------
// Token helpers
// --------------------
const getAccessToken = () => localStorage.getItem('access_token')
const getRefreshToken = () => localStorage.getItem('refresh_token')

function clearTokens() {
    TOKEN_KEYS.forEach(k => localStorage.removeItem(k))
}

function setAuthHeader(config, token) {
    if (!config.headers) {
        config.headers = {}
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}

function isAuthWhitelisted(input) {
    const url = typeof input === 'string' ? input : input?.url || ''
    return (
        AUTH_ENDPOINTS.some(p => url.includes(p)) ||
        WHITELIST_URLS.some(p => url.includes(p))
    )
}

// --------------------
// Axios instances
// --------------------
export const qcApi = axios.create({
    baseURL: QC_API_URL,
    timeout: 60_000,
    headers: { 'Content-Type': 'application/json' },
})

export const userApi = axios.create({
    baseURL: USER_API_URL,
    timeout: 60_000,
    headers: { 'Content-Type': 'application/json' },
})

/**
 * IMPORTANT:
 * Use a "raw" client for refresh to avoid interceptors / infinite loops.
 * (No auth header injection, no retry logic)
 */
const userApiRaw = axios.create({
    baseURL: USER_API_URL,
    timeout: 60_000,
    headers: { 'Content-Type': 'application/json' },
})

// --------------------
// Refresh logic (moved here to avoid api <-> userService circular import)
// --------------------
async function callRefresh() {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
        throw new Error('No refresh token available')
    }

    // NOTE: endpoint path assumes your user backend routes are /auth/refresh
    return userApiRaw.post('/auth/refresh', { refresh_token: refreshToken })
}

async function doRefreshOnce() {
    if (isRefreshing) {
        return refreshPromise
    }

    const rt = getRefreshToken()

    if (!rt) {
        throw new Error('No refresh token')
    }

    isRefreshing = true
    refreshPromise = callRefresh()
        .then((res) => {
            // Store tokens here (so retry requests can immediately use them)
            const data = res?.data?.data ?? res?.data
            const at = data?.access_token ?? data?.accessToken
            const rt2 = data?.refresh_token ?? data?.refreshToken
            const it = data?.id_token ?? data?.idToken

            if (at) localStorage.setItem('access_token', at)
            if (rt2) localStorage.setItem('refresh_token', rt2)
            if (it) localStorage.setItem('id_token', it)

            const atNew = getAccessToken()
            refreshQueue.splice(0).forEach(cb => cb(atNew))
            return res
        })
        .catch((err) => {
            refreshQueue.splice(0).forEach(cb => cb(null))
            throw err
        })
        .finally(() => {
            isRefreshing = false
            refreshPromise = null
        })

    return refreshPromise
}

async function handleAuthFailure(reason) {
    if (isLoggingOut) {
        return
    }

    isLoggingOut = true

    console.warn('Authentication failed:', reason)

    try {
        await store.dispatch('clearUserState')
        clearTokens()
    } finally {
        gotoCognitoLogin()
    }
}

// --------------------
// Error helpers
// --------------------
function checkStatus(status) {
    const map = {
        400: 'Bad Request',
        401: 'Unauthorized, please login again',
        403: 'Access Denied',
        404: 'Resource not found',
        408: 'Request Timeout',
        409: 'Conflict',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
    }
    return map[status] || 'Connection Error'
}

function getErrorMessage(data, status) {
    return data?.message || data?.error || data?.msg || (status ? checkStatus(status) : 'Unknown error')
}

// --------------------
// Retry helper
// --------------------
async function tryRefreshAndRetry(instance, originalConfig) {
    if (originalConfig._retried) {
        return Promise.reject(new Error('Retry already attempted'))
    }

    originalConfig._retried = true

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            refreshQueue.push((newToken) => {
                if (!newToken) reject(new Error('Refresh failed during queue wait'))
                else {
                    setAuthHeader(originalConfig, newToken)
                    resolve(instance(originalConfig))
                }
            })
        })
    }

    try {
        await doRefreshOnce()
        const atNew = getAccessToken()
        setAuthHeader(originalConfig, atNew)
        return instance(originalConfig)
    } catch (error) {
        return Promise.reject(error)
    }
}

// --------------------
// Apply interceptors to BOTH instances
// --------------------
function attachInterceptors(instance) {
    instance.interceptors.request.use(
        (config) => {
            const rid = nextReqId()
            config.__rid = rid
            config.__apiName = name

            const whitelisted = isAuthWhitelisted(config)

            if (!whitelisted) {
                setAuthHeader(config, getAccessToken())
            }

            return config
        },
        (error) => Promise.reject(error)
    )

    instance.interceptors.response.use(
        (res) => {
            return res
        },
        async (error) => {
            const cfg = error?.config || {}
            const httpStatus = error?.response?.status
            const respData = error?.response?.data

            if (httpStatus === 401) {
                if (isAuthWhitelisted(cfg)) {
                    await handleAuthFailure('401 on Whitelisted URL')
                    return Promise.reject(new Error('Authentication expired'))
                }

                if (isLoggingOut) {
                    return Promise.reject(new Error('Already logging out'))
                }

                try {
                    return await tryRefreshAndRetry(instance, cfg)
                } catch (e) {
                    await handleAuthFailure('Hard 401 refresh failed')
                    return Promise.reject(e)
                }
            }

            const errorMessage = getErrorMessage(respData, httpStatus) || error.message || 'Fail to connect to the server'
            const isTimeout = String(errorMessage).toLowerCase().includes('timeout')
            const finalMessage = isTimeout ? 'Network Request Timeout' : errorMessage

            ElMessage({
                message: finalMessage,
                type: 'error',
                duration: 2 * 1000,
            })

            return Promise.reject(new Error(finalMessage))
        }
    )
}

attachInterceptors(qcApi)
attachInterceptors(userApi)

export default qcApi
