"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Users,
  MessageSquare,
  Trash2,
  UserPlus,
  Key,
  LogOut,
  Home,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  createUser,
  deleteUser,
  toggleAdminStatus,
  resetUserPassword,
  clearAllMessages,
  toggleChatEnabled,
  type AdminUser,
} from "@/app/admin/actions";
import { signOutAction } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface AdminClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  users: AdminUser[];
  chatSettings: { isEnabled: boolean };
}

export function AdminClient({ currentUser, users: initialUsers, chatSettings: initialChatSettings }: AdminClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [chatSettings, setChatSettings] = useState(initialChatSettings);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  // Reset password state
  const [resetPassword, setResetPassword] = useState<{ userId: string; password: string } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createUser(
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.isAdmin
      );

      if (result.success) {
        toast.success("User created successfully!");
        setNewUser({ name: "", email: "", password: "", isAdmin: false });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success("User deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await toggleAdminStatus(userId);
      if (result.success) {
        toast.success("Admin status updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update admin status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword) return;

    setIsLoading(true);
    try {
      const result = await resetUserPassword(resetPassword.userId, resetPassword.password);
      if (result.success) {
        toast.success("Password reset successfully");
        setResetPassword(null);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear ALL messages? This cannot be undone!")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearAllMessages();
      if (result.success) {
        toast.success(`Cleared ${result.count} messages`);
      } else {
        toast.error(result.error || "Failed to clear messages");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChat = async () => {
    setIsLoading(true);
    try {
      const result = await toggleChatEnabled();
      if (result.success) {
        setChatSettings({ isEnabled: result.isEnabled! });
        toast.success(result.isEnabled ? "Chat enabled" : "Chat disabled");
      } else {
        toast.error(result.error || "Failed to toggle chat");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="min-h-screen bg-[#0f1119]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-[#1a1d2e] border-gray-800">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Shield className="h-6 w-6 text-purple-500" />
            <div>
              <h1 className="text-white font-bold text-base md:text-lg">Admin Panel</h1>
              <p className="text-xs text-gray-400">{currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-gray-800 text-white h-9"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-gray-800 text-white h-9"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Chat Controls */}
        <Card className="bg-[#1a1d2e] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5" />
              Chat Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleToggleChat}
                disabled={isLoading}
                className={`flex-1 ${
                  chatSettings.isEnabled
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {chatSettings.isEnabled ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Disable Chat
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Enable Chat
                  </>
                )}
              </Button>
              <Button
                onClick={handleClearChat}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Messages
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Chat is currently: <Badge variant={chatSettings.isEnabled ? "default" : "destructive"}>
                {chatSettings.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        {/* Create New User */}
        <Card className="bg-[#1a1d2e] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5" />
              Create New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-[#2a2d3e] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-[#2a2d3e] border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="bg-[#2a2d3e] border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isAdmin" className="text-gray-300">
                  Grant admin privileges
                </Label>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User List */}
        <Card className="bg-[#1a1d2e] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#2a2d3e] rounded-lg border border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      {user.isAdmin && (
                        <Badge variant="default" className="bg-purple-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.id === currentUser.id && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 break-all">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Messages: {user._count.messages} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {user.id !== currentUser.id && (
                      <>
                        <Button
                          onClick={() => handleToggleAdmin(user.id)}
                          disabled={isLoading}
                          size="sm"
                          variant="outline"
                          className="border-gray-700 hover:bg-gray-800 text-white"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          onClick={() =>
                            setResetPassword({ userId: user.id, password: "" })
                          }
                          disabled={isLoading}
                          size="sm"
                          variant="outline"
                          className="border-gray-700 hover:bg-gray-800 text-white"
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Reset Password
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={isLoading}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      {resetPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-[#1a1d2e] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetPassword.password}
                  onChange={(e) =>
                    setResetPassword({ ...resetPassword, password: e.target.value })
                  }
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="bg-[#2a2d3e] border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading || resetPassword.password.length < 8}
                  className="flex-1"
                >
                  Reset Password
                </Button>
                <Button
                  onClick={() => setResetPassword(null)}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

