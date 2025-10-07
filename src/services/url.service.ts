
import { url } from "@/app/services/url";

const BASE_URL = url

export const generateFilePath = (fileName: any) => {
  return `${BASE_URL}/uploads/${fileName}`;
};

export default BASE_URL

