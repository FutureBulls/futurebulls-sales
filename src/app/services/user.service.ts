import axiosAuth from '@/services/axios.service';
import { url } from './url';
import axios from 'axios'

const server_url = `${url}/api/v1`

export const loginUser = async (obj: any) => {
    try {
        return await axios.post(`${server_url}/auth/login`, obj)
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export const getSingleUserData = async () => {
    return axiosAuth.get(`${server_url}/user/profile`);
}

export const getStateData = async() => {
    return axiosAuth.get(`${server_url}/users/states`);
}