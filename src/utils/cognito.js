export function gotoCognitoLogin() {
    const env = import.meta.env

    const COGNITO_DOMAIN = env.VITE_COGNITO_DOMAIN
    const CLIENT_ID = env.VITE_COGNITO_CLIENT_ID
    const REDIRECT_URI = encodeURIComponent( env.VITE_CALLBACK_URL )
    const RESPONSE_TYPE = 'code'
    const SCOPE = env.VITE_COGNITO_SCOPE

    const redirectUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`
    console.log( '[gotoCognitoLogin] redirecting to:', redirectUrl )
    window.location.href = redirectUrl
}
