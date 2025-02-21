"use client";

import { Providers } from "@/redux/provider";
import { ToastContainer } from "react-toastify";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Providers>
  );
}
