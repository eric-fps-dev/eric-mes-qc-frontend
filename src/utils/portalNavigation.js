const PORTAL_BASE_URL = import.meta.env.VITE_PORTAL_BASE_URL

export function goToPortal(path) {
    if (!path.startsWith('/')) {
        throw new Error('Portal path must start with "/"')
    }

    window.location.assign(`${PORTAL_BASE_URL}/#${path}`)
}
