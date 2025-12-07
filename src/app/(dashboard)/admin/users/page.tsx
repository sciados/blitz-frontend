"use client";

import { AuthGate } from "src/components/AuthGate";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

// Types
interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  user_type: string | null;
  created_at: string;
  is_active: boolean;
  campaign_count: number;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "user",
    user_type: "",
  });
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users", searchQuery, roleFilter],
    queryFn: async (): Promise<User[]> => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role", roleFilter);
      const response = await api.get(`/api/admin/users?${params.toString()}`);
      return response.data as User[];
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      full_name: string;
      password: string;
      role: string;
      user_type: string;
    }) => {
      const response = await api.post("/api/admin/users", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully");
      setCreatingUser(false);
      setFormData({ email: "", full_name: "", password: "", role: "user", user_type: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create user");
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { full_name: string; role: string; user_type: string } }) => {
      const response = await api.put(`/api/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      setEditingUser(null);
      setFormData({ email: "", full_name: "", password: "", role: "user", user_type: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update user");
    },
  });

  // Activate/Deactivate user mutation
  const activateMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await api.post(`/api/admin/users/${id}/activate`, { is_active: isActive });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`User ${data.is_active ? 'activated' : 'deactivated'} successfully`);
      setActionUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update user status");
    },
  });

  const handleCreateUser = () => {
    setCreatingUser(true);
    setFormData({ email: "", full_name: "", password: "", role: "user", user_type: "" });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      role: user.role,
      user_type: user.user_type || "",
    });
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const createData = {
      ...formData,
      user_type: formData.user_type || "", // Ensure user_type is never null
    };
    createMutation.mutate(createData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updateData = {
        full_name: formData.full_name,
        role: formData.role || "user", // Ensure role is never empty
        user_type: formData.user_type || "", // Ensure user_type is never null
      };
      updateMutation.mutate({
        id: editingUser.id,
        data: updateData,
      });
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setActionUser(user);
  };

  const handleConfirmStatusChange = () => {
    if (actionUser) {
      const isDeactivating = actionUser.is_active;
      activateMutation.mutate({ id: actionUser.id, isActive: !isDeactivating });
    }
  };

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              User Management
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add User
          </button>
        </div>

        <div className="card rounded-lg p-4 mb-6 flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            style={{ borderColor: "var(--card-border)" }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="card rounded-lg overflow-hidden">
          {isLoading ? (
            <div
              className="p-8 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Loading users...
            </div>
          ) : !users || users.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: "var(--bg-secondary)" }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Role
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      User Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Campaigns
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Joined
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {user.full_name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {user.user_type || "—"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {user.campaign_count}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`px-3 py-1 rounded transition ${
                              user.is_active
                                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                            }`}
                          >
                            {user.is_active ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {creatingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card rounded-xl p-6 w-full max-w-md">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Create New User
            </h2>
            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    User Type
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) =>
                      setFormData({ ...formData, user_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    <option value="">None</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Creator">Creator</option>
                    <option value="Business">Business</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingUser(false);
                    setFormData({ email: "", full_name: "", password: "", role: "user", user_type: "" });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card rounded-xl p-6 w-full max-w-md">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Edit User
            </h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    User Type
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) =>
                      setFormData({ ...formData, user_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    <option value="">None</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Creator">Creator</option>
                    <option value="Business">Business</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ email: "", full_name: "", password: "", role: "user", user_type: "" });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable/Enable Confirmation Modal */}
      {actionUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card rounded-xl p-6 w-full max-w-md">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {actionUser.is_active ? "Disable User" : "Enable User"}
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to {actionUser.is_active ? "disable" : "enable"}{" "}
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {actionUser.email}
              </span>
              ? {actionUser.is_active
                ? "Disabled users cannot log in to the platform."
                : "The user will be able to log in again."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmStatusChange}
                disabled={activateMutation.isPending}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                  actionUser.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {activateMutation.isPending
                  ? actionUser.is_active
                    ? "Disabling..."
                    : "Enabling..."
                  : actionUser.is_active
                  ? "Disable User"
                  : "Enable User"}
              </button>
              <button
                onClick={() => setActionUser(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                style={{ borderColor: "var(--card-border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
