import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        verifyDaMeta1Token: builder.query({
            query: (token) => ({
                url: "daMeta1/verifyDaMeta1Token",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
        }),
    }),
});
export const {
    useVerifyDaMeta1TokenQuery
} = authApi;
