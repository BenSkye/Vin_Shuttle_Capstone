// import { useMutation } from '@tanstack/react-query'
// import { signIn, useSession } from 'next-auth/react'

// import { API } from '@/constants/apis'
// import { STATUS_CODE } from '@/constants/error-codes'
// import { Routes } from '@/constants/routers'
import { useDebouncedCallback } from './shared';

// import { authService } from '@/services/auth.service'

// import { posty } from '@/utils/request'

// export const useAuth = () => {
//   const { data, status } = useSession()

//   return {
//     token: data?.user?.accessToken,
//     authenticated: status === 'authenticated',
//     loading: status === 'loading',
//     user: data?.user || {},
//     id: data?.user?.id,
//     email: data?.user?.email,
//     firstName: data?.user?.firstName,
//     lastName: data?.user?.lastName,

//   }
// }

// export const useAuthVerifyToken = ({ onSuccess, onError } = {}) => {
//   const { mutate, isPending } = useMutation(
//     // async (body) => await posty(API.AUTH.VERIFY_TOKEN, body),
//     {
//       onSuccess: () => {
//         onSuccess?.()
//       },
//       onError: () => {
//         onError?.()
//       },
//     }
//   )

//   const doVerifyToken = useDebouncedCallback(mutate)

//   return { doVerifyToken, isLoading: isPending }
// }

// export const useLogin = () => {
//   const mutation = useMutation({
//     mutationFn: async (credentials) => {
//       try {
//         const response = await authService.login(credentials)

//         if (response.statusCode === STATUS_CODE.NORMAL) {
//           const userInfo = {
//             id: response.data.userInfo.id,
//             email: response.data.userInfo.email,
//             firstName: response.data.userInfo.firstName,
//             lastName: response.data.userInfo.lastName,
//             firstNameTranscription: response.data.userInfo.firstNameTranscription,
//             lastNameTranscription: response.data.userInfo.lastNameTranscription,
//           }

//           const userInfoString = tryParseString(userInfo)

//           const result = await signIn('credentials', {
//             ...credentials,
//             token: response.data.token,
//             userInfo: userInfoString,
//             redirect: false,
//           })

//           if (result.error) {
//             throw new Error(result.error)
//           }

//           return response.data
//         }

//         throw new Error(response.message)
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message
//         throw new Error(errorMessage)
//       }
//     },
//     onSuccess: async () => {
//       if (typeof window !== 'undefined') {
//         window.location.href = Routes.HOME
//       }
//     },
//   })

//   const doLogin = useDebouncedCallback(mutation.mutate)

//   return { doLogin, isLoading: mutation.isPending, error: mutation.error }
// }

// export const useSignup = ({ onSuccess, onError } = {}) => {
//   const mutation = useMutation({
//     mutationFn: async (formData) => {
//       try {
//         const response = await authService.signup(formData)

//         if (response.statusCode === STATUS_CODE.NORMAL) {
//           return response.data
//         }

//         throw new Error(response.message)
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message
//         throw new Error(errorMessage)
//       }
//     },
//     onSuccess: (data) => {
//       onSuccess?.(data)
//     },
//     onError: (error) => {
//       onError?.(error)
//     },
//   })

//   const doSignup = useDebouncedCallback(mutation.mutate)

//   return { doSignup, isLoading: mutation.isPending, error: mutation.error }
// }

// export const useResendEmailSignup = ({ onSuccess, onError } = {}) => {
//   const mutation = useMutation({
//     mutationFn: async (email) => {
//       return await authService.resendEmailSignup(email)
//     },
//     onSuccess: (data) => {
//       onSuccess?.(data)
//     },
//     onError: (error) => {
//       onError?.(error)
//     },
//   })

//   const doResendEmailSignup = useDebouncedCallback(mutation.mutate)

//   return {
//     doResendEmailSignup,
//     isLoading: mutation.isPending,
//     error: mutation.error,
//   }
// }

// export const useAuthVerifyEmail = ({ onSuccess, onError } = {}) => {
//   const mutation = useMutation({
//     mutationFn: async ({ email, token }) => {
//       try {
//         const response = await authService.verifyEmail({ email, token })

//         if (response.statusCode === STATUS_CODE.NORMAL) {
//           return response.data
//         }

//         throw new Error(response.message)
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message
//         throw new Error(errorMessage)
//       }
//     },
//     onSuccess: (data) => {
//       onSuccess?.(data)
//     },
//     onError: (error) => {
//       onError?.(error)
//     },
//   })

//   const doVerifyEmail = useDebouncedCallback(mutation.mutate)

//   return {
//     doVerifyEmail,
//     isLoading: mutation.isPending,
//     error: mutation.error,
//   }
// }

// export const useSendResetPasswordEmail = ({ onSuccess, onError } = {}) => {
//   const mutation = useMutation({
//     mutationFn: async (email) => {
//       try {
//         const response = await authService.sendResetPasswordEmail(email)

//         if (response.statusCode === STATUS_CODE.NORMAL) {
//           return response.data
//         }

//         throw new Error(response.message)
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message
//         throw new Error(errorMessage)
//       }
//     },
//     onSuccess: (data) => {
//       onSuccess?.(data)
//     },
//     onError: (error) => {
//       onError?.(error)
//     },
//   })

//   const doSendResetPasswordEmail = useDebouncedCallback(mutation.mutate)

//   return { doSendResetPasswordEmail, isLoading: mutation.isPending, error: mutation.error }
// }

// export const useResetPassword = ({ onSuccess, onError } = {}) => {
//   const mutation = useMutation({
//     mutationFn: async (data) => {
//       try {
//         const response = await authService.resetPassword(data)
//         if (response.statusCode === STATUS_CODE.NORMAL) {
//           return response.data
//         }
//         throw new Error(response.message)
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message
//         throw new Error(errorMessage)
//       }
//     },
//     onSuccess: (data) => {
//       onSuccess?.(data)
//     },
//     onError: (error) => {
//       onError?.(error)
//     },
//   })

//   const doResetPassword = useDebouncedCallback(mutation.mutate)

//   return { doResetPassword, isLoading: mutation.isPending, error: mutation.error }
// }
