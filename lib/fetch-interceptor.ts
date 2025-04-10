import { toast } from "sonner";

type FetchOptions = RequestInit & {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
};

export async function fetchWithInterceptor(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const {
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
        ...fetchOptions
    } = options;

    try {
        const response = await fetch(url, fetchOptions);

        // Try to parse the response as JSON to extract any messages
        let responseData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            // Clone the response to avoid consuming it
            const clonedResponse = response.clone();
            responseData = await clonedResponse.json();
        }

        // Handle success responses
        if (response.ok) {
            if (showSuccessToast) {
                const message = successMessage || responseData?.message || "Operation completed successfully";
                toast.success(message);
            }
            return response;
        }
        // Handle error responses
        else {
            if (showErrorToast) {
                const errorMessage = responseData?.message || response.statusText || "Something went wrong";
                toast.error(errorMessage);
            }
            return response;
        }
    } catch (error) {
        // Handle network/fetch errors
        if (showErrorToast) {
            toast.error(error instanceof Error ? error.message : "Network request failed");
        }
        throw error;
    }
}