"use client";

import { ToasterProvider } from "@/components/toaster-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { Session } from "next-auth";

// Create CSRF token context
export const CSRFContext = createContext<string>("");

export const useCSRFToken = () => useContext(CSRFContext);

interface ProvidersProps {
  children: ReactNode;
  csrfToken?: string;
  initialSession?: Session | null;
}

export function Providers({ children, csrfToken = "", initialSession = null }: ProvidersProps) {
  // Manage CSRF token client-side
  const [token, setToken] = useState(csrfToken);
  
  // Re-generate token periodically for better security
  useEffect(() => {
    const refreshToken = () => {
      // Generate a random token (simple version - in production consider stronger methods)
      const newToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      setToken(newToken);
      
      // Update the meta tag
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        metaTag.setAttribute('content', newToken);
      }
    };
    
    // Refresh token every hour
    const intervalId = setInterval(refreshToken, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <SessionProvider session={initialSession}>
      <CSRFContext.Provider value={token}>
        {children}
        <ToasterProvider/>
      </CSRFContext.Provider>
    </SessionProvider>
  );
}