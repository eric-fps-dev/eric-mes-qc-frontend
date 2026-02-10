export const regExps = (value, reg) => value.replace(new RegExp(`^${reg}`, 'g'), '')

export const getEnv = (envConf = {}) => {
    const defaults = {
        VITE_PORT: 3000,
        VITE_PROXY_DOMAIN: '/api',
        VITE_PROXY_DOMAIN_REAL: '',
        VITE_BACKEND_URL: 'http://localhost:8090/',
        VITE_MINIO_URL: 'http://localhost:9000',
        VITE_DEFAULT_BUCKET_NAME: 'default-bucket',
        VITE_LEGACY: false,
    }

    const ret = { ...defaults }

    for (const key of Object.keys(envConf)) {
        let v = envConf[key]

        if (typeof v === 'string') {
            v = v.replace(/\\n/g, '\n')
            if (v === 'true') v = true
            else if (v === 'false') v = false
            else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1)
            }
        }

        if (key === 'VITE_PORT' && v) {
            const n = Number(v)
            v = Number.isNaN(n) ? defaults.VITE_PORT : n
        }

        ret[key] = v
        process.env[key] = String(v)
    }

    return ret
}
