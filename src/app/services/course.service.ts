import axiosAuth from '@/services/axios.service'
import { url } from './url'
import axios from 'axios'

const server_url = `${url}/course`

export const courseDetails = async () => {
    return axiosAuth.get(`${server_url}/get-course-id-name`)
};