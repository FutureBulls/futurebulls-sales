import { jwtDecode } from "jwt-decode";
import { getToken } from "next-auth/jwt";

export async function getUserSession(req: any) {
    try {
        const session: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        
        if (session?.access_token) {
            return jwtDecode(session.access_token);
        } else {
            throw new Error("No access token found");
        }
    } catch (error) {
        console.log("fail", error);
        throw error;
    }
}

