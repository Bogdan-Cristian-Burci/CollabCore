"use client";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

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