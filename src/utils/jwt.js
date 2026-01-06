export function decodeJwt( token ) {
    try {
        const [, payload] = token.split( '.' )
        return JSON.parse( atob( payload ) )
    } catch {
        return null
    }
}
/**
 * Check whether the token is about to expire
 * @param {string} token - JWT access_token
 * @param {number} skewSeconds - The number of seconds for early refreshing
 */
export function willExpireSoon( token, skewSeconds = 120 ) {
    const payload = decodeJwt( token )
    if ( !payload || !payload.exp ) return true
    const now = Math.floor( Date.now() / 1000 )
    return payload.exp - now <= skewSeconds
}
