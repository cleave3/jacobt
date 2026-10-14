import Axios from 'axios'

export const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    withCredentials: true, // IMPORTANT for cookies
})

let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

axios.interceptors.response.use(
    (response) => {
        return response.data
    },
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite loops if the error occurs during login or refresh itself
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
                const message = error.response?.data?.message || 'Unauthorized'
                return Promise.reject(new Error(message))
            }

            if (isRefreshing) {
                // If already refreshing, queue this request until the refresh is done
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return axios(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Attempt to refresh the token
                await axios.post('/auth/refresh')
                isRefreshing = false
                processQueue(null)
                // Retry the original request
                return axios(originalRequest)
            } catch (err: any) {
                isRefreshing = false
                processQueue(err)
                // If refresh fails, the user is truly signed out
                localStorage.removeItem('user')
                window.location.href = '/login'
                return Promise.reject(err)
            }
        }

        const message = error.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)
