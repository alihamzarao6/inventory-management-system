"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/auth";
import { authApi } from "@/api/authApi";
import { claimAPI } from "@/api/claimApi"
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";

interface RootStateType {
    auth: ReturnType<typeof authReducer>;
    [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
    [claimAPI.reducerPath]: ReturnType<typeof claimAPI.reducer>;
}

const persistConfig: PersistConfig<RootStateType> = {
    key: "root",
    storage,
    whitelist: ["auth"],
};

const rootReducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [claimAPI.reducerPath]: claimAPI.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            authApi.middleware,
            claimAPI.middleware,
        ),
});

export const persistor = persistStore(store);

// Export RootState and AppDispatch for use with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
