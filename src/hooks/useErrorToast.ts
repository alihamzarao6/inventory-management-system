import { useCallback } from "react";
import useToast from "./useToast";
import { ErrorResponse, Web3Error, ApiError } from "@/types/errors";

const useErrorToast = () => {
    const { showToast } = useToast();

    const handleError = useCallback(
        (error: unknown): void => {
            let errorMessage: string;

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if ((error as Web3Error)?.data?.message) {
                // Handle Web3 specific errors
                errorMessage = (error as Web3Error).data.message;
            } else if ((error as ApiError)?.data?.message) {
                // Handle API errors
                errorMessage = (error as ApiError).data.message;
            } else if ((error as ErrorResponse)?.data?.message) {
                // Handle general errors
                errorMessage = (error as ErrorResponse).data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                errorMessage = "An unexpected error occurred";
            }

            showToast(errorMessage, "error");
        },
        [showToast]
    );

    return { handleError };
};

export default useErrorToast;