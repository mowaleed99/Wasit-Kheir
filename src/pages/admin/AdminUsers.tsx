import React, { useState } from "react";
import {
    useGetApiUsers,
    usePostApiUsersAdmin,
} from "@/api/generated/users/users";
import { usePutApiAdminUsersIdVerify } from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { Search, CheckCircle, Shield, UserX, UserCheck } from "lucide-react";
import { CreateAdminCommand } from "@/api/generated/lostAndFoundAPI.schemas";

export const AdminUsers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [adminForm, setAdminForm] = useState<CreateAdminCommand>({
        email: "",
        fullName: "",
        password: "",
        phone: "",
    });

    const {
        data: usersData,
        isLoading,
        error,
    } = useGetApiUsers({
        searchTerm: searchTerm || undefined,
        pageNumber: 1,
        pageSize: 100,
    });

    const { mutate: verifyUser, isPending: isVerifying } = usePutApiAdminUsersIdVerify();
    const { mutate: createAdmin, isPending: isCreatingAdmin } = usePostApiUsersAdmin();

    const rawData: any = (usersData as any)?.data || usersData;
    const usersList = Array.isArray(rawData) ? rawData : rawData?.data || [];

    const handleVerify = (id: number) => {
        verifyUser(
            { id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["/api/Users"] });
                },
            }
        );
    };

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        createAdmin(
            { data: adminForm },
            {
                onSuccess: () => {
                    setShowAddAdmin(false);
                    setAdminForm({ email: "", fullName: "", password: "", phone: "" });
                    queryClient.invalidateQueries({ queryKey: ["/api/Users"] });
                },
            }
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
                    <p className="text-gray-500 mt-1 text-sm">View user accounts and manage verification statuses.</p>
                </div>
                <button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Shield className="w-4 h-4" />
                    {showAddAdmin ? "Cancel" : "Add Admin"}
                </button>
            </div>

            {showAddAdmin && (
                <div className="mb-6 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin Account</h3>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={adminForm.fullName || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                required
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={adminForm.email || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                required
                                type="password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={adminForm.password || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={adminForm.phone || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isCreatingAdmin}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {isCreatingAdmin ? "Creating..." : "Create Admin User"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50">
                        <p className="text-red-600">Failed to load users.</p>
                    </div>
                ) : usersList.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                        <p className="text-gray-500 mt-1 text-sm">Try adjusting your search term.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Joined</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {usersList.map((usr: any) => (
                                    <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        usr.profilePictureUrl
                                                            ? `https://wasitkheir.runasp.net${usr.profilePictureUrl}`
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                usr.fullName || "User"
                                                            )}&background=3b82f6&color=fff`
                                                    }
                                                    alt={usr.fullName}
                                                    className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900 flex items-center gap-1">
                                                        {usr.fullName}
                                                        {usr.roles?.includes("Admin") && (
                                                            <div title="Admin" className="ml-1 inline-flex">
                                                                <Shield className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{usr.email}</div>
                                            {usr.phone && <div className="text-xs text-gray-400 mt-0.5">{usr.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(usr.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {usr.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    <UserX className="w-3 h-3" />
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!usr.isVerified && (
                                                <button
                                                    onClick={() => handleVerify(usr.id)}
                                                    disabled={isVerifying}
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                    Verify
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
