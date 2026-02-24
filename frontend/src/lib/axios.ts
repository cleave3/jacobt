import Axios from 'axios'

export const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // IMPORTANT for cookies
})

axios.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        const message = error.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)
