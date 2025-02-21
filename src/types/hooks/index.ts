// useNetworkGuard interface
export interface UseNetworkGuardProps {
    enforceNetwork?: boolean;  // Whether to automatically enforce network switching
    showToasts?: boolean;
}


// useToast interface
export type ToastType = 'success' | 'error' | 'info' | 'warning';
