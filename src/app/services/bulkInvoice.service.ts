import { axiosAuth } from "../../services/axios.service";
import { url } from "./url";

const server_url = `${url}/api/v1/razorpay`;

export const sendBulkInvoicesApi = async (formData: FormData) => {
  return axiosAuth.post(`${server_url}/bulk-invoices/send`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadBulkInvoicesApi = async (recordId: string) => {
  return axiosAuth.get(`${server_url}/bulk-invoices/download/${recordId}`, {
    responseType: 'blob',
  });
};

export const getBulkInvoiceHistoryApi = async () => {
  return axiosAuth.get(`${server_url}/bulk-invoices/history`);
};

export const retryBulkInvoicesApi = async (recordId: string) => {
  return axiosAuth.post(`${server_url}/bulk-invoices/retry/${recordId}`);
};
