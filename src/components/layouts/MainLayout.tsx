"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Package,
  ArrowLeftRight,
  PackagePlus,
  ScrollText,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ClipboardList,
  Truck,
  FileText,
  BarChart,
  User,
  Home,
  MenuIcon,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

type SidebarMode = "expanded" | "collapsed";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["Dashboard"]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if mobile on initial render and on window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarMode("expanded");
        setMobileMenuOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Main menu items
  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Products", icon: Package, path: "/products" },
    { title: "Transfer", icon: ArrowLeftRight, path: "/transfer" },
    { title: "Incoming Items", icon: PackagePlus, path: "/incoming-items" },
    { title: "Stock Adjustment", icon: ScrollText, path: "/stock-adjustment" },
    { title: "Customers", icon: Users, path: "/customer" },
    {
      title: "Admin",
      icon: Settings,
      path: "",
      hasSubmenu: true,
    },
  ];

  // Admin submenu items
  const adminMenuItems = [
    {
      name: "Reorder Alerts",
      icon: ClipboardList,
      path: "/admin/reorder-alerts",
    },
    {
      name: "Item Transfer Records",
      icon: Truck,
      path: "/admin/transfer-records",
    },
    {
      name: "Incoming Items Records",
      icon: Package,
      path: "/admin/incoming-records",
    },
    {
      name: "Stock Adjust Records",
      icon: FileText,
      path: "/admin/adjust-records",
    },
    { name: "Invoice Records", icon: FileText, path: "/admin/invoice-records" },
    { name: "Reports", icon: BarChart, path: "/admin/reports" },
    { name: "Logs", icon: FileText, path: "/admin/logs" },
    { name: "Users", icon: Users, path: "/admin/users" },
  ];

  // Handle navigation and breadcrumbs
  const handleNavigation = (
    title: string,
    path: string,
    isSubmenu: boolean = false
  ) => {
    setCurrentPage(title);

    // Update breadcrumbs
    if (isSubmenu) {
      setBreadcrumbs(["Dashboard", "Admin", title]);
    } else if (title === "Admin") {
      setBreadcrumbs(["Dashboard", "Admin"]);
    } else {
      setBreadcrumbs(["Dashboard", title]);
    }

    // Close mobile menu if on mobile
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Toggle sidebar mode for desktop
  const toggleSidebarMode = () => {
    setSidebarMode(sidebarMode === "expanded" ? "collapsed" : "expanded");
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Render sidebar for desktop
  const renderDesktopSidebar = () => (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 border-r border-gray-800 z-20",
        sidebarMode === "expanded" ? "w-64" : "w-16"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <Store className="h-6 w-6 mr-2" />
        {sidebarMode === "expanded" && (
          <span className="font-semibold">Inventory System</span>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
        <div className="flex-1">
          {/* Menu Items */}
          {menuItems.map((item) => (
            <div key={item.title}>
              <Link href={item.path}>
                <div
                  onClick={() => {
                    handleNavigation(item.title, item.path);
                    if (item.hasSubmenu) {
                      setAdminExpanded(!adminExpanded);
                    }
                  }}
                  className={cn(
                    "flex items-center p-4 transition-colors hover:bg-gray-800",
                    sidebarMode === "expanded"
                      ? "justify-between"
                      : "justify-center",
                    currentPage === item.title ||
                      (item.title === "Admin" && breadcrumbs.includes("Admin"))
                      ? "bg-gray-800 text-white"
                      : "text-gray-300"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        sidebarMode === "expanded" && "mr-3"
                      )}
                    />
                    {sidebarMode === "expanded" && <span>{item.title}</span>}
                  </div>
                  {item.hasSubmenu && sidebarMode === "expanded" && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        adminExpanded && "transform rotate-90"
                      )}
                    />
                  )}
                </div>
              </Link>

              {/* Admin Submenu */}
              {item.hasSubmenu &&
                item.title === "Admin" &&
                adminExpanded &&
                sidebarMode === "expanded" && (
                  <div className="bg-gray-800 pl-5 py-1">
                    {adminMenuItems.map((subItem) => (
                      <Link key={subItem.name} href={subItem.path}>
                        <div
                          onClick={() =>
                            handleNavigation(subItem.name, subItem.path, true)
                          }
                          className={cn(
                            "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors",
                            breadcrumbs[2] === subItem.name &&
                              "bg-gray-700 text-white"
                          )}
                        >
                          <subItem.icon className="h-4 w-4 mr-3" />
                          <span>{subItem.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div
          className={cn(
            "mt-auto border-t border-gray-800 p-4",
            sidebarMode === "collapsed" && "flex justify-center"
          )}
        >
          {sidebarMode === "expanded" ? (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div
          className={cn(
            "flex items-center p-4 text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-800",
            sidebarMode === "collapsed" && "justify-center"
          )}
        >
          <LogOut
            className={cn("h-5 w-5", sidebarMode === "expanded" && "mr-3")}
          />
          {sidebarMode === "expanded" && <span>Sign out</span>}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleSidebarMode}
        className="absolute -right-3 top-20 bg-gray-900 border border-gray-800 rounded-full p-1 text-gray-400 hover:text-white"
      >
        {sidebarMode === "expanded" ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </aside>
  );

  // Render mobile sidebar
  const renderMobileSidebar = () => (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 border-r border-gray-800 z-40 w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-800">
          <Store className="h-6 w-6 mr-2" />
          <span className="font-semibold">Inventory System</span>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <div className="flex-1">
            {/* Menu Items */}
            {menuItems.map((item) => (
              <div key={item.title}>
                <Link href={item.path}>
                  <div
                    onClick={() => {
                      handleNavigation(item.title, item.path);
                      if (item.hasSubmenu) {
                        setAdminExpanded(!adminExpanded);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between p-4 transition-colors hover:bg-gray-800",
                      currentPage === item.title ||
                        (item.title === "Admin" &&
                          breadcrumbs.includes("Admin"))
                        ? "bg-gray-800 text-white"
                        : "text-gray-300"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          adminExpanded && "transform rotate-90"
                        )}
                      />
                    )}
                  </div>
                </Link>

                {/* Admin Submenu */}
                {item.hasSubmenu && item.title === "Admin" && adminExpanded && (
                  <div className="bg-gray-800 pl-9 py-1">
                    {adminMenuItems.map((subItem) => (
                      <Link key={subItem.name} href={subItem.path}>
                        <div
                          onClick={() =>
                            handleNavigation(subItem.name, subItem.path, true)
                          }
                          className={cn(
                            "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors",
                            breadcrumbs[2] === subItem.name &&
                              "bg-gray-700 text-white"
                          )}
                        >
                          <subItem.icon className="h-4 w-4 mr-3" />
                          <span>{subItem.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex items-center p-4 text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-800">
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sign out</span>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render appropriate sidebar based on screen size */}
      {isMobile ? renderMobileSidebar() : renderDesktopSidebar()}

      {/* Main Content Area */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isMobile ? "ml-0" : sidebarMode === "expanded" ? "ml-64" : "ml-16"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-10">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          )}

          {/* Logo and Company Name - Centered on mobile, left on desktop */}
          <div
            className={cn("flex items-center", isMobile ? "mx-auto" : "ml-4")}
          >
            <Store className="h-6 w-6 mr-2 text-gray-900" />
            <span className="font-semibold text-gray-900">
              Inventory System
            </span>
          </div>

          {/* Breadcrumbs - Hidden on mobile, visible on desktop */}
          {!isMobile && (
            <div className="ml-auto flex items-center">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span
                    className={cn(
                      "text-sm",
                      index === breadcrumbs.length - 1
                        ? "font-medium text-gray-900"
                        : "text-gray-500"
                    )}
                  >
                    {crumb}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
