import axios from 'axios'
import { translate } from '../i18n/LanguageContext'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('serviceflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('serviceflow_token')
      localStorage.removeItem('serviceflow_user')
      window.dispatchEvent(new Event('serviceflow:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export function apiMessage(error) {
  const message = error.response?.data?.message || 'Something went wrong. Please try again.'
  const language = document.documentElement.lang === 'tr' ? 'tr' : 'en'
  return translate(message, language)
}
