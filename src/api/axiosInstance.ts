import axios from 'axios'

const instance = axios.create({
  timeout: 3000,
})

instance.defaults.headers.post['Content-Type'] = 'application/json'
instance.defaults.headers.put['Content-Type'] = 'application/json'
instance.defaults.headers.patch['Content-Type'] = 'application/json'

/*
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
*/

export default instance
