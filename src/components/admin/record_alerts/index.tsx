"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReorderTable from "./reorder_table";
import Sidebar from "../admin-sidebar";
import { InventoryItem } from "@/types/inventory";

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Item 1",
    category: "Electronics",
    quantity: 11,
    reorderLevel: 10,
  },
  {
    id: 2,
    name: "Item 2",
    category: "Clothing",
    quantity: 80,
    reorderLevel: 100,
  },
];

export default function ReorderAlerts() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 space-y-6 w-full bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between shadow-md p-4 rounded-lg bg-gray-100">
          <h2 className="text-xl font-semibold">Reorder Alerts</h2>
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 shadow-sm border-gray-300"
          />
        </div>

        <Tabs
          defaultValue="all"
          className="p-6 rounded-xl bg-gray-50 shadow-lg"
        >
          <TabsList className="flex gap-3 p-3 rounded-xl shadow-lg">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ReorderTable data={inventoryData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
