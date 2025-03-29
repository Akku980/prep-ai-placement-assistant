import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL || 'https://prepai-backend.onrender.com'

const api = axios.create({
  baseURL: BACKEND,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/prep-ai-placement-assistant/login'
    }
    return Promise.reject(err)
  }
)

export default api
export const BACKEND_URL = BACKEND
