import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

// POST - Revert a custom role back to system default
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const id = await Promise.resolve(params.id);
  
  const response = await proxyRequest(
    request,
    `/api/roles/${id}/revert`,
    {
      method: "POST",
      successMessage: "Role reverted to system default successfully",
      customErrorMessage: `Failed to revert role with ID ${id} to system default`
    }
  );
  
  // Revalidate roles data paths to update UI
  revalidatePath("/api/roles");
  revalidatePath(`/api/roles/${id}`);
  
  return response;
}