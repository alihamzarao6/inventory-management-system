import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { RootProvider } from "@/providers";
import Header from "@/components/ui/header";
import MainLayout from "@/components/layouts/MainLayout";

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Crypto Tokens Claiming Platform",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={workSans.variable}>
      <body className="font-work-sans">
        <RootProvider>
          <MainLayout>{children}</MainLayout>
        </RootProvider>
      </body>
    </html>
  );
}
