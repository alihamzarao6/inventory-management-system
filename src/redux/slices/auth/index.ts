import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    userName: string;
    claimedTokens: number;
    availableTokens: number;
    totalSupply: number;
    tokenExpiry?: number | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isTokenExpired: boolean;
    pendingAuth: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isTokenExpired: false,
    pendingAuth: false
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        startAuthProcess: (state) => {
            state.pendingAuth = true;
            state.isTokenExpired = false;
        },
        setAuthData: (state, action: PayloadAction<{
            user: User;
            token: string;
        }>) => {
            const tokenExpiry = Date.now() + (60 * 60 * 1000);

            state.user = {
                ...action.payload.user,
                tokenExpiry
            };
            state.token = action.payload.token;
            state.isTokenExpired = false;
            state.pendingAuth = false;

            // console.log(`Token set to expire at: ${new Date(tokenExpiry).toLocaleTimeString()}`);
            // console.log(`Current time: ${new Date().toLocaleTimeString()}`);

            // cookie for middleware
            document.cookie = `auth-token=${action.payload.token}; path=/; max-age=3600`;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.pendingAuth = false;
            document.cookie = 'auth-token=; path=/; max-age=0';
        },
        setTokenExpired: (state, action: PayloadAction<boolean>) => {
            if (state.pendingAuth && action.payload === true) {
                console.log("Ignoring token expiration during auth process");
                return;
            }
            state.isTokenExpired = action.payload;
        }
    },
});

export const { clearAuth, setAuthData, setTokenExpired, startAuthProcess } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
    state?.auth?.user;

export const selectCurrentToken = (state: { auth: AuthState }) =>
    state?.auth?.token;

export const selectIsTokenExpired = (state: { auth: AuthState }) =>
    state?.auth?.isTokenExpired;

export const selectIsPendingAuth = (state: { auth: AuthState }) =>
    state?.auth?.pendingAuth;