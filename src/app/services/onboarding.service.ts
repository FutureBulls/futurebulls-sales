import axiosAuth from '@/services/axios.service'
import { url } from './url'
import axios from 'axios'
import { generateSignature } from '../utils/payloadSign';

const server_url = `${url}/api/onboarding`

export const getOnboardingAPI = async () => {
    return axiosAuth.get(`${server_url}`)
};

export const getOnboardingDataByID = async (id: any) => {
    return axiosAuth.get(`${server_url}/${id}`)
};

export const updateOnboardingDetails = async (payload: any) => {
    const payloadSignature = generateSignature(payload);
    return axiosAuth.put(`${server_url}/${payload._id}`, {
      payload,
      payloadSignature,
    });
  };