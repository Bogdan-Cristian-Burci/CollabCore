"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    
    // Add console logs to help debug authentication status
    console.log("Auth status:", status);
    console.log("Session data:", session);
  }, [status, router, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading authentication data...</p>
      </div>
    );
  }
  
  // Safety check - if no session but we're not in loading state
  if (!session && status !== "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Please log in to view the dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!</h2>
          <p className="text-gray-600">You are now authenticated and can access protected resources.</p>
          
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">Your Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {session?.user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}