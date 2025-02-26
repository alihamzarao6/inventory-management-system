"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StockBadge from "./stock_badge";
import EditReorderLevelModal from "./edit_reorder_level_modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

type Props = { data: InventoryItem[] };

export default function ReorderTable({ data }: Props) {
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
          <TableHead>Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Avatar className="mx-auto">
                  <AvatarImage src="https://github.com/shadcn.png" alt={item.name} />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="text-base">{item.name}</TableCell>
              <TableCell className="text-base">{item.category}</TableCell>
              <TableCell className="text-base">{item.quantity}</TableCell>
              <TableCell className="text-base">{item.reorderLevel}</TableCell>
              <TableCell>
                <StockBadge quantity={item.quantity} reorderLevel={item.reorderLevel} />
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="hover:bg-gray-200" onClick={() => setEditItem(item)} variant="secondary" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editItem && <EditReorderLevelModal item={editItem} onClose={() => setEditItem(null)} />}
    </TooltipProvider>
  );
}
