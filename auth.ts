import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {LoginResponseResource, UserResource} from "@/types/user";
import {JWT} from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Use the correct backend URL
                    const apiUrl = "http://localhost/api/login";
                    
                    // Make the login request
                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Origin": "http://localhost:3000",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!response.ok) {
                        return null;
                    }

                    const data : LoginResponseResource = await response.json();

                    const user: User = {
                        id: String(data.user.id),
                        name: data.user.name,
                        email: data.user.email,
                        accessToken: String(data.token)
                    }
                    return user;

                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User | undefined }) {
            if (user) {
                token.accessToken = user.accessToken;
                // Make sure we have user data
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.accessToken = String(token.accessToken) as string;
                // Ensure the session has all necessary user data
                session.user.name = session.user.name || token.user.name as string;
                session.user.email = session.user.email || token.user.email as string;
                session.user.id = session.user.id || token.user.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
})