"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Copy,
  Plus,
  Check,
  X,
  Trash,
  Edit,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import useToast from "@/hooks/useToast";

// Mock data for users and roles
interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  permissions: {
    viewLocations: string[];
    itemDetailsView: string[];
    addItems: string[];
    editItems: string[];
    transferStockFrom: string[];
    transferStockTo: string[];
    adjustStock: string[];
    incomingItems: string[];
    viewTransferRecords: string[];
    viewStockAdjustRecords: string[];
    approveStockAdjust: string[];
    viewIncomingRecords: string[];
    adminPermissions: string[];
  };
  createdAt: string;
  lastLoginAt: string;
}

const ROLES = [
  { id: "admin", name: "Administrator" },
  { id: "manager", name: "Manager" },
  { id: "stockkeeper", name: "Stock Keeper" },
  { id: "sales", name: "Sales Associate" },
  { id: "viewer", name: "Viewer" },
];

const ADMIN_PERMISSIONS = [
  { id: "add_warehouse", name: "Add New Warehouse" },
  { id: "add_store", name: "Add New Store" },
  { id: "add_customer", name: "Add New Customer" },
  { id: "create_user", name: "Create New User" },
  { id: "view_invoices", name: "View Invoices" },
  { id: "generate_invoices", name: "Generate Invoices" },
  { id: "view_delivery_notes", name: "View Delivery Notes" },
  { id: "view_reorder_alerts", name: "View Reorder Alerts" },
  { id: "edit_reorder_alerts", name: "Edit Reorder Alerts" },
  { id: "view_logs", name: "View Logs" },
  { id: "view_reports", name: "View Reports" },
  { id: "view_users", name: "View Users" },
];

// Generate mock users
const generateMockUsers = (): User[] => {
  // Admin user
  const adminUser: User = {
    id: "user-1",
    username: "User01",
    password: "Password",
    role: "admin",
    permissions: {
      viewLocations: ["all"],
      itemDetailsView: ["all"],
      addItems: ["all"],
      editItems: ["all"],
      transferStockFrom: ["all"],
      transferStockTo: ["all"],
      adjustStock: ["all"],
      incomingItems: ["all"],
      viewTransferRecords: ["all"],
      viewStockAdjustRecords: ["all"],
      approveStockAdjust: ["all"],
      viewIncomingRecords: ["all"],
      adminPermissions: ADMIN_PERMISSIONS.map((p) => p.id),
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // Manager user
  const managerUser: User = {
    id: "user-2",
    username: "User02",
    password: "Password",
    role: "manager",
    permissions: {
      viewLocations: ["all"],
      itemDetailsView: ["all"],
      addItems: ["all"],
      editItems: ["all"],
      transferStockFrom: ["all"],
      transferStockTo: ["all"],
      adjustStock: ["all"],
      incomingItems: ["all"],
      viewTransferRecords: ["all"],
      viewStockAdjustRecords: ["all"],
      approveStockAdjust: ["all"],
      viewIncomingRecords: ["all"],
      adminPermissions: ["view_reorder_alerts", "view_logs", "view_reports"],
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // Stock Keeper user
  const stockKeeperUser: User = {
    id: "user-3",
    username: "User03",
    password: "Password",
    role: "stockkeeper",
    permissions: {
      viewLocations: ["all"],
      itemDetailsView: ["all"],
      addItems: ["all"],
      editItems: ["all"],
      transferStockFrom: ["all"],
      transferStockTo: ["all"],
      adjustStock: ["all"],
      incomingItems: ["all"],
      viewTransferRecords: ["all"],
      viewStockAdjustRecords: ["all"],
      approveStockAdjust: [],
      viewIncomingRecords: ["all"],
      adminPermissions: ["view_reorder_alerts"],
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  return [adminUser, managerUser, stockKeeperUser];
};

const UsersPage = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // User creation/edit states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    role: string;
    permissions: {
      viewLocations: string[];
      itemDetailsView: string[];
      addItems: string[];
      editItems: string[];
      transferStockFrom: string[];
      transferStockTo: string[];
      adjustStock: string[];
      incomingItems: string[];
      viewTransferRecords: string[];
      viewStockAdjustRecords: string[];
      approveStockAdjust: string[];
      viewIncomingRecords: string[];
      adminPermissions: string[];
    };
  }>({
    username: "",
    password: "",
    role: "",
    permissions: {
      viewLocations: [],
      itemDetailsView: [],
      addItems: [],
      editItems: [],
      transferStockFrom: [],
      transferStockTo: [],
      adjustStock: [],
      incomingItems: [],
      viewTransferRecords: [],
      viewStockAdjustRecords: [],
      approveStockAdjust: [],
      viewIncomingRecords: [],
      adminPermissions: [],
    },
  });

  // Initialize users
  useEffect(() => {
    // In a real app, this would be an API call
    const mockUsers = generateMockUsers();
    setUsers(mockUsers);
  }, []);

  // Filter users based on search
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Generate a random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle user creation
  const handleCreateUser = () => {
    // Reset form
    setNewUser({
      username: "",
      password: generatePassword(),
      role: "viewer",
      permissions: {
        viewLocations: [],
        itemDetailsView: [],
        addItems: [],
        editItems: [],
        transferStockFrom: [],
        transferStockTo: [],
        adjustStock: [],
        incomingItems: [],
        viewTransferRecords: [],
        viewStockAdjustRecords: [],
        approveStockAdjust: [],
        viewIncomingRecords: [],
        adminPermissions: [],
      },
    });
    setShowPassword(true);
    setIsCreateUserOpen(true);
  };

  // Handle saving new user
  const handleSaveNewUser = () => {
    // Validation
    if (!newUser.username) {
      showToast("Username is required", "error");
      return;
    }

    if (!newUser.password) {
      showToast("Password is required", "error");
      return;
    }

    if (!newUser.role) {
      showToast("Role is required", "error");
      return;
    }

    // Create new user
    const user: User = {
      id: `user-${users.length + 1}`,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      permissions: newUser.permissions,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Add to users
    setUsers([...users, user]);

    // Close modal
    setIsCreateUserOpen(false);

    // Show success message
    showToast("User created successfully", "success");
  };

  // Handle editing user
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setShowPassword(false);
    setIsEditUserOpen(true);
  };

  // Handle saving edited user
  const handleSaveEditedUser = () => {
    if (!userToEdit) return;

    // Update user
    setUsers(
      users.map((user) => (user.id === userToEdit.id ? userToEdit : user))
    );

    // Close modal
    setIsEditUserOpen(false);

    // Show success message
    showToast("User updated successfully", "success");
  };

  // Handle delete user confirmation
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirming user deletion
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    // Remove user
    setUsers(users.filter((user) => user.id !== userToDelete));

    // Close modal
    setIsDeleteConfirmOpen(false);

    // Show success message
    showToast("User deleted successfully", "success");
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(`${type} copied to clipboard`, "success");
      })
      .catch(() => {
        showToast(`Failed to copy ${type}`, "error");
      });
  };

  // Toggle all locations for a permission type
  const toggleAllLocations = (permissionType: keyof User["permissions"]) => {
    if (userToEdit) {
      // Check if all locations are already selected
      const allSelected =
        userToEdit.permissions[permissionType].includes("all");

      // Toggle between all or none
      setUserToEdit({
        ...userToEdit,
        permissions: {
          ...userToEdit.permissions,
          [permissionType]: allSelected ? [] : ["all"],
        },
      });
    }
  };

  // Toggle admin permission
  const toggleAdminPermission = (permissionId: string) => {
    if (userToEdit) {
      const isSelected =
        userToEdit.permissions.adminPermissions.includes(permissionId);

      setUserToEdit({
        ...userToEdit,
        permissions: {
          ...userToEdit.permissions,
          adminPermissions: isSelected
            ? userToEdit.permissions.adminPermissions.filter(
                (p) => p !== permissionId
              )
            : [...userToEdit.permissions.adminPermissions, permissionId],
        },
      });
    }
  };

  // Render permission section
  const renderPermissionSection = (
    title: string,
    permissionKey: keyof User["permissions"],
    user: User
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium mb-2">{title}</Label>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-blue-600 py-0"
            onClick={() => toggleAllLocations(permissionKey)}
          >
            Select All
          </Button>
        </div>
        <div className="border rounded-md p-2">
          <Select
            defaultValue={
              user.permissions[permissionKey].includes("all") ? "all" : ""
            }
            onValueChange={(value) => {
              setUserToEdit({
                ...user,
                permissions: {
                  ...user.permissions,
                  [permissionKey]: value === "all" ? ["all"] : [],
                },
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select locations user can ${title.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">None</SelectItem>
              <SelectItem value="all">All Locations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Log out all users
  const handleLogOutAllUsers = () => {
    // In a real app, this would call an API to log out all users
    showToast("All users have been logged out", "success");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Create and manage system users and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={handleLogOutAllUsers}
            className="bg-red-500 hover:bg-red-600"
          >
            LOG ALL USERS OUT
          </Button>
          <Button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New User
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <div className="w-full md:w-1/2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">
                          Username: {user.username}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-8 text-blue-600"
                          onClick={() =>
                            copyToClipboard(user.username, "Username")
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-600">
                          Password: {user.password}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-8 text-blue-600"
                          onClick={() =>
                            copyToClipboard(user.password, "Password")
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Checkbox id={`select-${user.id}`} />
                  </div>

                  <h4 className="font-bold mb-2">Permissions:</h4>
                  <div className="text-sm">
                    <p>
                      View Locations:{" "}
                      {user.permissions.viewLocations.includes("all")
                        ? "All"
                        : user.permissions.viewLocations.join(", ") || "None"}
                    </p>
                    <p>
                      View Item Details:{" "}
                      {user.permissions.itemDetailsView.includes("all")
                        ? "All"
                        : user.permissions.itemDetailsView.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to Add Items:{" "}
                      {user.permissions.addItems.includes("all")
                        ? "All"
                        : user.permissions.addItems.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to Edit Items:{" "}
                      {user.permissions.editItems.includes("all")
                        ? "All"
                        : user.permissions.editItems.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to Transfer Stock from:{" "}
                      {user.permissions.transferStockFrom.includes("all")
                        ? "All"
                        : user.permissions.transferStockFrom.join(", ") ||
                          "None"}
                    </p>
                    <p>
                      Locations to Transfer Stock to:{" "}
                      {user.permissions.transferStockTo.includes("all")
                        ? "All"
                        : user.permissions.transferStockTo.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to Adjust Stock:{" "}
                      {user.permissions.adjustStock.includes("all")
                        ? "All"
                        : user.permissions.adjustStock.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to do Incoming Items:{" "}
                      {user.permissions.incomingItems.includes("all")
                        ? "All"
                        : user.permissions.incomingItems.join(", ") || "None"}
                    </p>
                    <p>
                      Locations to View Transfer Records:{" "}
                      {user.permissions.viewTransferRecords.includes("all")
                        ? "All"
                        : user.permissions.viewTransferRecords.join(", ") ||
                          "None"}
                    </p>
                    <p>
                      Locations to View Stock Adjust Records:{" "}
                      {user.permissions.viewStockAdjustRecords.includes("all")
                        ? "All"
                        : user.permissions.viewStockAdjustRecords.join(", ") ||
                          "None"}
                    </p>
                    <p>
                      Locations to Approve/Deny Stock Adjust Records:{" "}
                      {user.permissions.approveStockAdjust.includes("all")
                        ? "All"
                        : user.permissions.approveStockAdjust.join(", ") ||
                          "None"}
                    </p>
                    <p>
                      Locations to View Incoming Items Records:{" "}
                      {user.permissions.viewIncomingRecords.includes("all")
                        ? "All"
                        : user.permissions.viewIncomingRecords.join(", ") ||
                          "None"}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <h4 className="font-bold mb-2">Admin Permissions:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADMIN_PERMISSIONS.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`admin-${permission.id}`}
                          checked={user.permissions.adminPermissions.includes(
                            permission.id
                          )}
                          disabled
                        />
                        <Label
                          htmlFor={`admin-${permission.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center p-10 text-gray-500">
            {searchTerm
              ? "No users found matching your search"
              : "No users available"}
          </div>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(newUser.username, "Username")
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(newUser.password, "Password")
                        }
                      >
                        Copy
                      </Button>
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-8 mt-1 text-blue-600"
                      onClick={() =>
                        setNewUser({ ...newUser, password: generatePassword() })
                      }
                    >
                      Automatically Generate Password
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Permissions</h3>
                {/* Permission sections would go here, similar to the edit user dialog */}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Admin Permissions</h3>
              <div className="grid grid-cols-1 gap-2">
                {ADMIN_PERMISSIONS.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`new-admin-${permission.id}`}
                      checked={newUser.permissions.adminPermissions.includes(
                        permission.id
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              adminPermissions: [
                                ...newUser.permissions.adminPermissions,
                                permission.id,
                              ],
                            },
                          });
                        } else {
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              adminPermissions:
                                newUser.permissions.adminPermissions.filter(
                                  (p) => p !== permission.id
                                ),
                            },
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`new-admin-${permission.id}`}
                      className="cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateUserOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewUser}
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-6xl h-[90vh] bg-white !overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>

          {userToEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-username"
                        value={userToEdit.username}
                        onChange={(e) =>
                          setUserToEdit({
                            ...userToEdit,
                            username: e.target.value,
                          })
                        }
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(userToEdit.username, "Username")
                        }
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-password">Password</Label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="edit-password"
                            type={showPassword ? "text" : "password"}
                            value={userToEdit.password}
                            onChange={(e) =>
                              setUserToEdit({
                                ...userToEdit,
                                password: e.target.value,
                              })
                            }
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(userToEdit.password, "Password")
                          }
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={userToEdit.role}
                      onValueChange={(value) =>
                        setUserToEdit({ ...userToEdit, role: value })
                      }
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Permissions</h3>
                  {renderPermissionSection(
                    "Locations User Can View",
                    "viewLocations",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Item Details User Can View",
                    "itemDetailsView",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can Add Items to",
                    "addItems",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations Users can Edit Items from",
                    "editItems",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can Transfer Stock from",
                    "transferStockFrom",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can Transfer Stock to",
                    "transferStockTo",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can Adjust Stock",
                    "adjustStock",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can do Incoming Items",
                    "incomingItems",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can View Transfer Records",
                    "viewTransferRecords",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can View Stock Adjust Records",
                    "viewStockAdjustRecords",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can Approve/Deny Stock Adjust Records",
                    "approveStockAdjust",
                    userToEdit
                  )}
                  {renderPermissionSection(
                    "Locations User Can View Incoming Items Records",
                    "viewIncomingRecords",
                    userToEdit
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Admin Permissions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {ADMIN_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`edit-admin-${permission.id}`}
                        checked={userToEdit.permissions.adminPermissions.includes(
                          permission.id
                        )}
                        onCheckedChange={() =>
                          toggleAdminPermission(permission.id)
                        }
                      />
                      <Label
                        htmlFor={`edit-admin-${permission.id}`}
                        className="cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUserToEdit({
                        ...userToEdit,
                        permissions: {
                          ...userToEdit.permissions,
                          adminPermissions:
                            userToEdit.permissions.adminPermissions.length ===
                            ADMIN_PERMISSIONS.length
                              ? []
                              : ADMIN_PERMISSIONS.map((p) => p.id),
                        },
                      });
                    }}
                  >
                    {userToEdit.permissions.adminPermissions.length ===
                    ADMIN_PERMISSIONS.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedUser}
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center p-4 mb-4 text-amber-800 border-l-4 border-amber-300 bg-amber-50">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <p>
              Deleting a user will remove all their permissions and access to
              the system.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
