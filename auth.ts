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
                        accessToken: String(data.token),
                        // Add token expiration time if backend provides it
                        // If not, set our own expiration (e.g., 1 hour from now)
                        tokenExpires: data.expiresIn ? new Date(Date.now() + data.expiresIn * 1000).toISOString() : 
                            new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
                        refreshToken: data.refreshToken || null
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
        async jwt({ token, user, trigger }: { token: JWT; user?: User | undefined; trigger?: string }) {
            if (user) {
                // Set token when user first signs in
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.tokenExpires = user.tokenExpires;
                token.user = user;
            }

            // If token exists but is expired, try to refresh it
            const now = Date.now() / 1000;
            if (token.tokenExpires && now > new Date(token.tokenExpires).getTime() / 1000) {
                try {
                    // Implement refresh token logic if backend supports it
                    if (token.refreshToken) {
                        const response = await fetch("http://localhost/api/refresh", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                refreshToken: token.refreshToken,
                            }),
                        });

                        if (response.ok) {
                            const refreshedTokens = await response.json();
                            token.accessToken = refreshedTokens.token;
                            token.tokenExpires = refreshedTokens.expiresIn ? 
                                new Date(Date.now() + refreshedTokens.expiresIn * 1000).toISOString() : 
                                new Date(Date.now() + 60 * 60 * 1000).toISOString();
                            
                            // Update refresh token if provided
                            if (refreshedTokens.refreshToken) {
                                token.refreshToken = refreshedTokens.refreshToken;
                            }
                        } else {
                            // If refresh fails, force re-login
                            return { ...token, error: "RefreshTokenError" };
                        }
                    }
                } catch (error) {
                    console.error("Error refreshing token:", error);
                    return { ...token, error: "RefreshTokenError" };
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.accessToken = String(token.accessToken) as string;
                session.user.tokenExpires = token.tokenExpires as string;
                session.user.refreshToken = token.refreshToken as string || null;
                session.user.error = token.error || null;
                
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
        error: "/login?error=session" // Redirect on session errors
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1 hour
    },
    jwt: {
        maxAge: 60 * 60, // 1 hour
    },
    // Enable CSRF protection
    secret: process.env.NEXTAUTH_SECRET,
})