"use client"
import React from "react";
import Link from "next/link";
import {
  Menu,
  Store,
  Package,
  ArrowLeftRight,
  PackagePlus,
  ScrollText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState("Dashboard");

  const menuItems = [
    { title: "Dashboard", icon: Store, path: "/" },
    { title: "Products", icon: Package, path: "/products" },
    { title: "Transfer", icon: ArrowLeftRight, path: "/transfer" },
    { title: "Incoming Items", icon: PackagePlus, path: "/incoming-items" },
    { title: "Stock Adjust", icon: ScrollText, path: "/stock-adjust" },
    { title: "Customers", icon: Users, path: "/customers" },
    { title: "Admin", icon: Settings, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 p-0 bg-gray-900 border-r border-gray-800"
            >
              <SheetHeader className="p-4 border-b border-gray-800">
                <SheetTitle className="text-lg font-semibold text-white">
                  Inventory System
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="flex-1 py-2">
                  {menuItems.map((item) => (
                    <Link key={item.title} href={item.path}>
                    <button
                      key={item.title}
                      onClick={() => {
                        setCurrentPage(item.title);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors",
                        currentPage === item.title && "bg-gray-800 text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                    </Link>
                  ))}
                </div>
                <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 transition-colors mt-auto mb-4">
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold">{currentPage}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 mx-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
