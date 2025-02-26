import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/types/inventory";
import { cn } from "@/lib/utils";

type Props = { item: InventoryItem; onClose: () => void };

export default function EditReorderLevelModal({ item, onClose }: Props) {
  const [newLevel, setNewLevel] = useState<number>(item.reorderLevel);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (newLevel < 0) {
      setError("Reorder level cannot be negative.");
      return;
    }
    setError(null);
    // Save logic here
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white shadow-2xl rounded-xl p-6 space-y-4">
        <DialogHeader className="bg-gradient-to-r  to-gray-700 text-gray-700 p-4 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold">Edit Reorder Level</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <p className="text-gray-600 text-md">
            Adjust the reorder level for <span className="font-semibold">{item.name}</span>.
          </p>

          <Input
            type="number"
            value={newLevel}
            onChange={(e) => setNewLevel(parseInt(e.target.value))}
            className={cn(
              "w-full text-5xl border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-gray-600 ",
              error && "border-red-500"
            )}
          />
          {error && <p className=" text-red-500 text-xs">{error}</p>}
        </div>

        <DialogFooter className="flex justify-end space-x-2 p-4 rounded-b-lg">
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-200 rounded-xl">Cancel</Button>
          <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
