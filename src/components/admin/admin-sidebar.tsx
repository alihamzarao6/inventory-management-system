'use client';

import { useState } from 'react';
import { cn } from '@/utils'; // Utility function for conditional classNames (if you use shadcn utils)
import { Button } from '@/components/ui/button';
import { Home, Package, Truck, FileText, BarChart, Users, ClipboardList } from 'lucide-react';

const menuItems = [
  { name: 'Reorder Alerts', icon: ClipboardList },
  { name: 'Item Transfer Records', icon: Truck },
  { name: 'Incoming Items Records', icon: Package },
  { name: 'Stock Adjust Records', icon: FileText },
  { name: 'Invoice Records', icon: FileText },
  { name: 'Reports', icon: BarChart },
  { name: 'Logs', icon: FileText },
  { name: 'Users', icon: Users },
];

export default function Sidebar() {
  const [active, setActive] = useState('Reorder Alerts');

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white shadow-lg p-4">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-xl font-bold">Inventory System</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={cn(
              'flex items-center w-full px-4 py-2 text-left rounded-lg transition-colors',
              active === item.name ? 'bg-gray-700' : 'hover:bg-gray-800'
            )}
            onClick={() => setActive(item.name)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
