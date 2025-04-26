"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  User,
  ArrowRight,
  Edit,
  Plus,
  LogIn,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { format } from "date-fns";

// Mock data for system logs
const generateMockLogs = () => {
  const actions = [
    {
      action: "Logged In",
      icon: <LogIn className="h-4 w-4 text-green-500" />,
      details: "IP Address",
    },
    {
      action: "Logged Out",
      icon: <LogOut className="h-4 w-4 text-gray-500" />,
      details: "IP Address",
    },
    {
      action: "Transfer",
      icon: <ArrowRight className="h-4 w-4 text-blue-500" />,
      details: "Location → Location",
    },
    {
      action: "Stock Adjust",
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      details: "Pending - Location",
    },
    {
      action: "Stock Adjust",
      icon: <Edit className="h-4 w-4 text-green-500" />,
      details: "Completed - Location",
    },
    {
      action: "Stock Adjust",
      icon: <Edit className="h-4 w-4 text-red-500" />,
      details: "Denied - Location",
    },
    {
      action: "Incoming Shipment",
      icon: <Plus className="h-4 w-4 text-purple-500" />,
      details: "Location",
    },
    {
      action: "Item Created",
      icon: <Plus className="h-4 w-4 text-blue-500" />,
      details: "Item Name - Location",
    },
    {
      action: "Item Edited",
      icon: <Edit className="h-4 w-4 text-blue-500" />,
      details: "Item Name - Cost Price Edited (Old → New) - Location",
    },
    {
      action: "Item Edited",
      icon: <Edit className="h-4 w-4 text-blue-500" />,
      details: "Item Name - Sales Price Edited (Old → New) - Location",
    },
    {
      action: "Warehouse Created",
      icon: <Plus className="h-4 w-4 text-amber-500" />,
      details: "Warehouse Name",
    },
    {
      action: "Store Created",
      icon: <Plus className="h-4 w-4 text-green-500" />,
      details: "Store Name",
    },
    {
      action: "Customer Created",
      icon: <Plus className="h-4 w-4 text-blue-500" />,
      details: "Customer Name",
    },
    {
      action: "User Created",
      icon: <User className="h-4 w-4 text-purple-500" />,
      details: "Username",
    },
  ];

  const logs = [];

  // Generate mock usernames
  const usernames = Array.from({ length: 32 }, (_, i) => `User${i + 1}`);

  // Generate 200 mock logs for pagination testing
  for (let i = 0; i < 200; i++) {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomUser = usernames[Math.floor(Math.random() * usernames.length)];

    const timestamp = new Date();
    timestamp.setHours(
      timestamp.getHours() - Math.floor(Math.random() * 24 * 30)
    ); // Random time in the last 30 days

    const timeStr = timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const dateStr = timestamp.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    logs.push({
      id: `log-${i + 1}`,
      username: randomUser,
      action: randomAction.action,
      icon: randomAction.icon,
      details: randomAction.details,
      time: timeStr,
      date: dateStr,
      timestamp: timestamp.toISOString(),
    });
  }

  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

const LogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedLogs, setPaginatedLogs] = useState<any[]>([]);

  // Filter states
  const [usernameFilter, setUsernameFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isUsernameFilterOpen, setIsUsernameFilterOpen] = useState(false);
  const [isActionFilterOpen, setIsActionFilterOpen] = useState(false);

  // Initialize logs
  useEffect(() => {
    // In a real app, this would be an API call
    const mockLogs = generateMockLogs();
    setLogs(mockLogs);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.username.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term)
      );
    }

    // Apply username filter
    if (usernameFilter) {
      filtered = filtered.filter((log) => log.username === usernameFilter);
    }

    // Apply action filter
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate <= toDate;
      });
    }

    setFilteredLogs(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchTerm, usernameFilter, actionFilter, dateRange, itemsPerPage]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLogs(filteredLogs.slice(startIndex, endIndex));
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Get unique usernames for filter
  const uniqueUsernames = [...new Set(logs.map((log) => log.username))].sort();

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))].sort();

  // Get date range label
  const getDateRangeLabel = () => {
    if (!dateRange.from && !dateRange.to) return "Filter by date";

    if (dateRange.from && dateRange.to) {
      if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
        return format(dateRange.from, "d MMM yyyy");
      }
      return `${format(dateRange.from, "d MMM")} - ${format(
        dateRange.to,
        "d MMM yyyy"
      )}`;
    }

    if (dateRange.from) {
      return `From ${format(dateRange.from, "d MMM yyyy")}`;
    }

    if (dateRange.to) {
      return `Until ${format(dateRange.to, "d MMM yyyy")}`;
    }

    return "Filter by date";
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUsernameFilter("");
    setActionFilter("");
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-500 mt-1">
          View all system activity and user actions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-10 w-full h-12 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  dateRange.from || dateRange.to
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {getDateRangeLabel()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={dateRange}
                // @ts-ignore
                onSelect={setDateRange}
                numberOfMonths={2}
                defaultMonth={dateRange.from || new Date()}
              />
              <div className="flex items-center justify-between p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDateRange({ from: undefined, to: undefined })
                  }
                  className="text-xs"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsDateFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-3">
          <Popover
            open={isUsernameFilterOpen}
            onOpenChange={setIsUsernameFilterOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  usernameFilter
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {usernameFilter ? usernameFilter : "Filter by username"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <div className="p-2">
                <div className="mb-2 text-sm font-medium text-gray-700 px-2 py-1">
                  Select User
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      usernameFilter === "" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => {
                      setUsernameFilter("");
                      setIsUsernameFilterOpen(false);
                    }}
                  >
                    All Users
                  </Button>
                  {uniqueUsernames.map((username) => (
                    <Button
                      key={username}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        usernameFilter === username &&
                          "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => {
                        setUsernameFilter(username);
                        setIsUsernameFilterOpen(false);
                      }}
                    >
                      {username}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-2">
          <Popover
            open={isActionFilterOpen}
            onOpenChange={setIsActionFilterOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  actionFilter
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {actionFilter
                      ? `Action: ${actionFilter}`
                      : "Filter by action"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="end">
              <div className="p-2">
                <div className="mb-2 text-sm font-medium text-gray-700 px-2 py-1">
                  Select Action
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      actionFilter === "" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => {
                      setActionFilter("");
                      setIsActionFilterOpen(false);
                    }}
                  >
                    All Actions
                  </Button>
                  {uniqueActions.map((action) => (
                    <Button
                      key={action}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        actionFilter === action && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => {
                        setActionFilter(action);
                        setIsActionFilterOpen(false);
                      }}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Applied Filters */}
      {(usernameFilter || actionFilter || dateRange.from || dateRange.to) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>

          {usernameFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              User: {usernameFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setUsernameFilter("")}
              />
            </Badge>
          )}

          {actionFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Action: {actionFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setActionFilter("")}
              />
            </Badge>
          )}

          {dateRange.from && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              From: {format(dateRange.from, "d MMM yyyy")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setDateRange({ ...dateRange, from: undefined })}
              />
            </Badge>
          )}

          {dateRange.to && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              To: {format(dateRange.to, "d MMM yyyy")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setDateRange({ ...dateRange, to: undefined })}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Logs Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Username</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.icon}
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>{log.date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    {searchTerm ||
                    usernameFilter ||
                    actionFilter ||
                    dateRange.from ||
                    dateRange.to
                      ? "No logs found matching your filters"
                      : "No system logs available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;

              // If there are more than 5 pages and we're not on the first page
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i;

                // Don't go beyond the last page
                if (pageNum > totalPages) {
                  return null;
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-8 h-8 p-0",
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-2">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0 text-gray-700"
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
