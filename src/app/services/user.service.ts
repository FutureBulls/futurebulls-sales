import axiosAuth from '@/services/axios.service';
import { url } from './url';
import axios from 'axios'

const server_url = `${url}/api/v1/razorpay`

export const loginUser =async (obj:any) => {
    return axios.post(`${server_url}/sales/login`,obj)
}

export const getSingleUserData = async () => {
    return axiosAuth.get(`${server_url}/sales/employee`);
}

export const getStateData = async() => {
    return axiosAuth.get(`${url}/users/get-states`);
}