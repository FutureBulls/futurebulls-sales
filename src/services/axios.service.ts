import axios from 'axios'
export const axiosAuth = axios.create();
import { getSession, signOut } from 'next-auth/react';

axiosAuth.interceptors.request.use(
    async function (config) {

        const session: any = await getSession();

    

        if (session?.token?.access_token) {
            config.headers['Authorization'] = `Bearer ${session?.token?.access_token}`
        }
        else if (window) {
            let url = new URLSearchParams(window.location.search.substring(1));
            console.log(url, 'URL WITH TOKEN....')
            let token = url.get('token')
            if (token)
                config.headers['Authorization'] = `Bearer ${token}`
            console.log(token, 'URL - TOKEN....')
        }
        return config
    },
    function (error) {
        console.log(error, 'error in interceptor request')
        if (error.response.status === 401) {
            signOut();
        }
        return Promise.reject(error)
    }
)

axiosAuth.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.log(error, 'error in interceptor response')
        if (error.response && error.response.status === 401) {
            signOut()
        }
        return Promise.reject(error)
    }
)

export default axiosAuth
