// import axios from 'axios'
// import { refresh } from '@/services/userService'
// import { gotoCognitoLogin } from '@/utils/cognito'
// import { ElMessage } from 'element-plus'
//
// import store from '@/store'
//
//
// const QC_API_URL = '/api' // ✅ go through Vite proxy in local dev
//
// const WHITE_LIST = ['/callback', '/logout-success', '/refresh']
//
// // --------------------
// // Constants
// // --------------------
// const TOKEN_KEYS = ['access_token', 'refresh_token']
// const REFRESH_URLS = ['/auth/refresh', '/auth/callback', '/auth/logout']
// const WHITELIST_URLS = WHITE_LIST.map(p => `/auth${p}`)
//
// // --------------------
// // State
// // --------------------
// let isRefreshing = false
// let isLoggingOut = false
// let refreshPromise = null
// const refreshQueue = []
//
// // --------------------
// // Token helpers
// // --------------------
// const getAccessToken = () => localStorage.getItem('access_token')
// const getRefreshToken = () => localStorage.getItem('refresh_token')
//
// function clearTokens() {
//     TOKEN_KEYS.forEach(k => localStorage.removeItem(k))
// }
//
// function setAuthHeader(config, token) {
//     if (!config.headers) config.headers = {}
//     if (token) config.headers.Authorization = `Bearer ${token}`
//     return config
// }
//
// function isAuthWhitelisted(input) {
//     const url = typeof input === 'string' ? input : input?.url || ''
//     return (
//         REFRESH_URLS.some(p => url.includes(p)) ||
//         WHITELIST_URLS.some(p => url.includes(p))
//     )
// }
//
// // --------------------
// // Refresh logic
// // --------------------
// async function doRefreshOnce() {
//     if (isRefreshing) return refreshPromise
//
//     const rt = getRefreshToken()
//     if (!rt) throw new Error('No refresh token')
//
//     isRefreshing = true
//     refreshPromise = refresh()
//         .then(() => {
//             const at = getAccessToken()
//             refreshQueue.splice(0).forEach(cb => cb(at))
//         })
//         .catch(err => {
//             refreshQueue.splice(0).forEach(cb => cb(null))
//             throw err
//         })
//         .finally(() => {
//             isRefreshing = false
//             refreshPromise = null
//         })
//
//     return refreshPromise
// }
//
// async function handleAuthFailure(reason) {
//     if (isLoggingOut) return
//     isLoggingOut = true
//
//     console.warn('Authentication failed:', reason)
//
//     try {
//         await store.dispatch('clearUserState')
//         clearTokens()
//     } finally {
//         console.log(`Auth failure ${reason}, logging out and navigating to cognito login`)
//         gotoCognitoLogin()
//     }
// }
//
// // --------------------
// // Error helpers
// // --------------------
// function getErrorMessage(data, status) {
//     return (
//         data?.message ||
//         data?.error ||
//         data?.msg ||
//         (status ? checkStatus(status) : 'Unknown error')
//     )
// }
//
// function checkStatus(status) {
//     const map = {
//         400: 'Bad Request',
//         401: 'Unauthorized, please login again',
//         403: 'Access Denied',
//         404: 'Resource not found',
//         408: 'Request Timeout',
//         409: 'Conflict',
//         500: 'Internal Server Error',
//         501: 'Not Implemented',
//         502: 'Bad Gateway',
//         503: 'Service Unavailable',
//         504: 'Gateway Timeout',
//         505: 'HTTP Version Not Supported',
//     }
//     return map[status] || 'Connection Error'
// }
//
// // --------------------
// // Retry helper
// // --------------------
// async function tryRefreshAndRetry( instance, originalConfig ) {
//     // Avoiding an infinite loop
//     if ( originalConfig._retried ) {
//         return Promise.reject( new Error( 'Retry already attempted' ) )
//     }
//     originalConfig._retried = true
//
//     // If the page is being refreshed: Suspend the current request and replay it after the refresh is complete.
//     if ( isRefreshing ) {
//         return new Promise( ( resolve, reject ) => {
//             refreshQueue.push( newToken => {
//                 if ( !newToken ) {
//                     reject( new Error( 'Refresh failed during queue wait' ) )
//                 } else {
//                     setAuthHeader( originalConfig, newToken )
//                     resolve( instance( originalConfig ) )
//                 }
//             } )
//         } )
//     }
//     // Start refreshing
//     try {
//         await doRefreshOnce()
//         const atNew = getAccessToken()
//         setAuthHeader( originalConfig, atNew )
//         return instance( originalConfig )
//     } catch ( error ) {
//         return Promise.reject( error )
//     }
// }
//
// // --------------------
// // Axios instance
// // --------------------
// const api = axios.create({
//     baseURL: QC_API_URL,
//     timeout: 60_000,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// })
//
// // --------------------
// // Request interceptor
// // --------------------
// api.interceptors.request.use(
//     config => {
//         if (!isAuthWhitelisted(config)) {
//             setAuthHeader(config, getAccessToken())
//         }
//         return config
//     },
//     error => Promise.reject(error)
// )
//
// api.interceptors.response.use(
//     async res => {
//         return res
//     },
//     async error => {
//         const cfg = error?.config || {}
//         const httpStatus = error?.response?.status
//         const respData = error?.response?.data
//
//         if ( httpStatus === 401 ) {
//             if ( isAuthWhitelisted( cfg ) ) {
//                 // Go to login page
//                 await handleAuthFailure( '401 on Whitelisted URL' )
//                 return Promise.reject( new Error( 'Authentication expired' ) )
//             }
//
//             if ( isLoggingOut ) {
//                 return Promise.reject( new Error( 'Already logging out' ) )
//             }
//
//             try {
//                 return await tryRefreshAndRetry( api, cfg )
//             } catch ( e ) {
//                 await handleAuthFailure( 'Hard 401 refresh failed' )
//                 return Promise.reject( e )
//             }
//         }
//
//         // Other errors: Keep the original prompt
//         const errorMessage =
//             getErrorMessage( respData, httpStatus ) || error.message || 'Fail to connect to the server'
//         const isTimeout = ( errorMessage || '' ).toLowerCase().includes( 'timeout' )
//         const finalMessage = isTimeout ? 'Network Request Timeout' : errorMessage || 'Fail to connect to the server'
//         ElMessage( {
//             message : finalMessage,
//             type : 'error',
//             duration : 2 * 1000
//         } )
//         return Promise.reject( new Error( finalMessage ) )
//     }
// )
//
// export default api
//
