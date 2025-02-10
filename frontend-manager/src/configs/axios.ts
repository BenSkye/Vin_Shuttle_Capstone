import axios, { HttpStatusCode} from "axios";
import { API_URL_BE_DEV, TIMEOUT } from "./api";


const instance = axios.create({
    baseURL: API_URL_BE_DEV,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(async (request) => {
    // const token = await getToken();
    // if (token) {
    //     request.headers.Authorization = `Bearer ${token}`;
    // }
    return request;
});

 const redirectIfUnauthorized = () => {
    if ( typeof window !== 'undefined' ) {
        window.location.href = '/login';
        localStorage.clear();
        return;
    }
}

 instance.interceptors.response.use(
    (response) => response,
    (error) => {
       if (error?.response?.status === HttpStatusCode.Unauthorized) {
        redirectIfUnauthorized();
       }
       return Promise.reject(error);
    }
 )
