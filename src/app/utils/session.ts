import { getToken } from "next-auth/jwt";

export const sessionStatus = async (req: any) => {
  const token = await getToken({ req });

  return token ? true : false;
};
