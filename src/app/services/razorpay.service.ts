import axiosAuth from "@/services/axios.service";
import { url } from "./url";
import { generateSignature } from "../utils/payloadSign";

const server_url = `${url}/api/v1/razorpay`;

export const createPaymentLink = async (payload: any) => {
  const payloadSignature = generateSignature(payload);
  return axiosAuth.post(`${server_url}/create/payment-links`, {
    payload,
    payloadSignature,
  });
};

export const getPaymentLink = async () => {
  return axiosAuth.get(`${server_url}/get/paymentlink`);
};

export const getPaymentLinkDataById = async (paymentId: any) => {
  return axiosAuth.get(
    `${server_url}/get/payment-link-details?paymentLinkId=${paymentId}`,
  );
};

export const updateOrderForAdmin = async (paymentId: any, notes: any) => {
  const payloadSignature = generateSignature(paymentId);
  return axiosAuth.put(`${server_url}/update/payment`, {
    paymentLinkId: paymentId,
    notes,
    payloadSignature,
  });
};

export const getAnalyticsData = async () => {
  return axiosAuth.get(`${server_url}/get/analytics-data`);
};

export const getAnalyticsUserData = async (userId?: any, startDate?: string, endDate?: string) => {
  return axiosAuth.get(
    `${server_url}/get/analytics-data-for-admin?searchUserId=${userId}&startDate=${startDate}&endDate=${endDate}}`
  );
};


export const downloadInvoiceApi = async (invoiceId: any) => {
  return axiosAuth.get(`${server_url}/download-invoice?id=${invoiceId}`);
};

export const getSalesUserList = async () => {
  return axiosAuth.get(`${server_url}/get/users`);
};

export const createSaleUser = async (payload: any) => {
  return axiosAuth.post(`${server_url}/create/user`, payload);
};


export const fetchCsvData = (startDate: string, endDate: string, selectedUserType: string ) => {
  return axiosAuth.get(`${server_url}/get/analytics-csv-data?startDate=${startDate}&endDate=${endDate}&userID=${selectedUserType?selectedUserType:"all"}`);
}



// export const fetchPDFdata = async (startDate: string, endDate: string, selectedUserType: string) => {
//   try {
//     const response = await axiosAuth.get(
//       `${server_url}/get/analytics-pdf-data?startDate=${startDate}&endDate=${endDate}&userID=${selectedUserType || "all"}`,
//       { responseType: 'blob' } 
//     );
//     return response;
//   } catch (error: any) {
//     if (error.response?.status === 404) {
//       throw new Error(error.response.data?.message || "No data found for the selected date range.");
//     }
//     throw new Error(error?.message || "An unexpected error occurred while fetching the PDF data.");
//   }
// };
