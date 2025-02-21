// Basic error response structure
export interface ErrorResponse {
    data: {
        message: string;
        code?: string | number;
        details?: unknown;
    };
    status?: number;
    statusText?: string;
}

// Validation Specific Error
export interface ValidationError extends ErrorResponse {
    data: {
        message: string;
        fields: {
            [key: string]: string[];
        };
    };
}

// Web3 specific errors
export interface Web3Error extends ErrorResponse {
    data: {
        message: string;
        code: string;
        reason?: string;
        transaction?: {
            hash?: string;
            from?: string;
            to?: string;
        };
    };
}

// API error types
export interface ApiError extends ErrorResponse {
    data: {
        message: string;
        code: number;
        path?: string;
        timestamp?: string;
    };
}