import {
    fetchBaseQuery,
    FetchArgs,
    FetchBaseQueryError,
    BaseQueryFn,
} from "@reduxjs/toolkit/query/react";

import baseUrl from "./apiConfig";
import { RootState } from "@/redux/store";
import { clearAuth, setTokenExpired } from "@/redux/slices/auth";

const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "same-origin",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    const customError = result.error as FetchBaseQueryError & { originalStatus?: number };

    if (result?.error?.status === 401 ||
        result?.meta?.response?.status === 401 ||
        customError?.originalStatus === 401) {
        // Instead of redirecting, dispatch actions to show modal
        api.dispatch(clearAuth());
        api.dispatch(setTokenExpired(true));
    }
    return result;
};