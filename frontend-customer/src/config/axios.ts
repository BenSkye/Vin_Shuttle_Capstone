// import axios, { HttpStatusCode } from 'axios'
// import { getSession, signOut } from 'next-auth/react'
// import { v4 as uuidv4 } from 'uuid'

// import { API_ROOT, TIMEOUT } from '@/constants/apis'
// import { Routes } from '@/constants/routers'

// // import logger from '@/utils/logger'

// const instance = axios.create({
//   baseURL: API_ROOT,
//   timeout: TIMEOUT,
// })

// instance.interceptors.request.use(async (request) => {
//   const session = await getSession()
//   if (session) {
//     request.headers.Authorization = `Bearer ${session.user.accessToken}`
//   }

//   request.headers['X-Request-Id'] = uuidv4()
//   request.headers['X-Event-Time'] = new Date().getTime()
//   request.headers['X-Channel'] = 'WEB'

//   return request
// })

// const redirectIfUnAuthorized = async () => {
//   if (typeof window !== 'undefined') {
//     window.location.href = Routes.AUTH.LOGIN
//     localStorage.clear()

//     // Clear token
//     const session = await getSession()
//     if (session) {
//       await signOut()
//     }
//   }
// }

// instance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.code === 'ECONNABORTED') {
//       return 'timeout'
//     }

//     if (error?.response?.status === HttpStatusCode.Unauthorized) {
//       redirectIfUnAuthorized()
//     }

//     // logger.error(error)
//     return Promise.reject(error)
//   }
// )

// export default instance
