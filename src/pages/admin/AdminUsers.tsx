import React, { useState } from "react";
import {
    useGetApiUsers,
    usePostApiUsersAdmin,
} from "@/api/generated/users/users";
import { usePutApiAdminUsersIdVerify, useDeleteApiAdminUsersId } from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { Search, CheckCircle, Shield, UserX, UserCheck, Users as UsersIcon, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { CreateAdminCommand } from "@/api/generated/lostAndFoundAPI.schemas";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

export const AdminUsers: React.FC = () => {
    const { t } = useTranslation();
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
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteApiAdminUsersId();

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

    const handleDeleteUser = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to permanently delete the user "${name}"? This action cannot be undone.`)) {
            deleteUser(
                { id },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["/api/Users"] });
                    },
                }
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('admin.users.title', 'User Management')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t('admin.users.subtitle', 'Manage accounts, verify identities, and assign administrative roles.')}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={() => setShowAddAdmin(!showAddAdmin)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto ${
                            showAddAdmin 
                                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        }`}
                    >
                        {showAddAdmin ? (
                            <>{t('admin.users.cancel', 'Cancel')}</>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                {t('admin.users.addAdmin', 'Add New Admin')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Add Admin Form */}
            {showAddAdmin && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('admin.users.createAdminTitle', 'Create Administrator Account')}</h3>
                    </div>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.users.form.fullName', 'Full Name')}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={adminForm.fullName || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.users.form.email', 'Email Address')}</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={adminForm.email || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.users.form.password', 'Password')}</label>
                            <input
                                required
                                type="password"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={adminForm.password || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.users.form.phone', 'Phone Number (Optional)')}</label>
                            <input
                                type="text"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={adminForm.phone || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={isCreatingAdmin}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                {isCreatingAdmin ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <Shield className="w-4 h-4" />}
                                {isCreatingAdmin ? t('admin.users.form.creating', 'Creating...') : t('admin.users.form.submit', 'Create Admin')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Controls */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="w-5 h-5 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('admin.users.searchPlaceholder', 'Search by name, email, or role...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-0">
                    {isLoading ? (
                        <div className="py-16 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.users.loading', 'Loading users...')}</p>
                        </div>
                    ) : error ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                                <UserX className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.users.errorTitle', 'Error Loading Data')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.users.error', 'Failed to fetch users. Please try again.')}</p>
                        </div>
                    ) : usersList.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-3">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.users.noUsers', 'No Users Found')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.users.noUsersDesc', 'No users match your current search criteria.')}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {usersList.map((usr: any) => (
                                <li key={usr.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    {/* Avatar & Core Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={
                                                    usr.profilePictureUrl
                                                        ? resolveImageUrl(usr.profilePictureUrl)
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(usr.fullName || "User")}&background=random&color=fff`
                                                }
                                                alt={usr.fullName}
                                                className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover bg-gray-100 dark:bg-gray-800"
                                            />
                                            {usr.roles?.includes("Admin") && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-900" title="Administrator">
                                                    <Shield className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                {usr.fullName}
                                            </h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {usr.email}
                                                </span>
                                                {usr.phone && (
                                                    <span className="flex items-center gap-1.5 truncate">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {usr.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                                        {usr.isVerified ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('admin.users.table.verified', 'Verified')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                <UserX className="w-3 h-3" />
                                                {t('admin.users.table.unverified', 'Unverified')}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('admin.users.table.joined', 'Joined')} {new Date(usr.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="shrink-0 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-gray-200 dark:border-gray-800 flex items-center gap-2">
                                        {!usr.isVerified && (
                                            <button
                                                onClick={() => handleVerify(usr.id)}
                                                disabled={isVerifying || isDeleting}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-md transition-colors disabled:opacity-50"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                <span className="sm:hidden lg:inline">{t('admin.users.table.verify', 'Verify User')}</span>
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => handleDeleteUser(usr.id, usr.fullName)}
                                            disabled={isVerifying || isDeleting}
                                            className="p-1.5 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                                            title={t('admin.users.table.deleteUser', 'Delete User')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
