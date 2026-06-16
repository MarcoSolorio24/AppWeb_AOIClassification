import axios from 'axios'

const client = axios.create({
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default client