// import queryString from 'query-string'

// import Axios from '@/configs/axios'

// import { DEFAULT_PAGE_SIZE } from '@/constants/common'

// export function buildURL(url, query) {
//   let _url = url
//   if (query) {
//     _url += /\?/.test(url) ? '&' : '?'
//     if (typeof query === 'object') {
//       _url += queryString.stringify(query)
//     } else {
//       _url += query
//     }
//   }
//   return _url
// }

// export async function fetchy(URL, params) {
//   const response = await Axios.get(buildURL(URL, params))
//   return response.data
// }

// export async function posty(URL, data) {
//   const response = await Axios.post(URL, data)
//   return response.data
// }

// export async function puty(URL, data) {
//   const response = await Axios.put(URL, data)
//   return response.data
// }

// export async function deletey(URL, data) {
//   const response = await Axios.delete(URL, data)
//   return response.data
// }

// export async function patchy(URL, data) {
//   const response = await Axios.patch(URL, data)
//   return response.data
// }

// export async function fetcher(URL, params) {
//   const { page, pageSize = DEFAULT_PAGE_SIZE, ...rest } = params || {}
//   const url = buildURL(URL, { page: page || 0, pageSize, ...rest })

//   const response = await Axios.get(url)
//   return response?.data
// }

// export async function postFromData(URL, data) {
//   const response = await Axios.post(URL, data, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   })
//   return response.data
// }
