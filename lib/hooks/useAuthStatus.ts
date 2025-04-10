"use client";

import { useSession } from "next-auth/react";

export function useAuthStatus() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const accessToken = session?.user?.accessToken;

  return {
    isLoading,
    isAuthenticated,
    user,
    accessToken,
  };
}