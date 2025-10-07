import { loginUser } from "@/app/services/user.service";
import { decodeToken } from "@/app/utils/jwt.util";
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        let user: any = {};
        try {
          if (!req.body) return null;

          const res = await loginUser(credentials);

          if (res.data.token) {
            const tokenDecoded: any = decodeToken(res.data.token);
            user = {
              id: tokenDecoded.userId,
              accessToken: res.data.token,
              decoded_token: tokenDecoded,
            };

            return user;
          }
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.message || error.message || "Login failed";
          throw new Error(errorMsg);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day session expiration
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.access_token = (user as any)?.accessToken;
        token.decoded_token = (user as any)?.decoded_token;
        token.name = (user as any)?.decoded_token?.user?.name;
      }
      return token;
    },
    async session({ session, token }) {
      return { ...session, token };
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Add secret
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
