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
        <div className="w-full pb-12">
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-stone-900 via-stone-800 to-neutral-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{t('admin.users.title', 'User Management')}</h1>
                    <p className="text-stone-300 max-w-lg">{t('admin.users.subtitle', 'Manage accounts, verify identities, and assign administrative roles.')}</p>
                </div>

                <div className="relative z-10 flex-shrink-0">
                    <button
                        onClick={() => setShowAddAdmin(!showAddAdmin)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg transition-all ${
                            showAddAdmin 
                                ? "bg-stone-800 hover:bg-stone-700 text-white" 
                                : "bg-amber-500 hover:bg-amber-600 text-stone-950 hover:scale-105 hover:shadow-amber-500/25"
                        }`}
                    >
                        {showAddAdmin ? (
                            <>Cancel Creation</>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                {t('admin.users.addAdmin', 'Add New Admin')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Add Admin Form */}
            {showAddAdmin && (
                <div className="mb-8 bg-card p-8 rounded-3xl border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{t('admin.users.createAdminTitle', 'Create Administrator Account')}</h3>
                    </div>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">{t('admin.users.form.fullName', 'Full Name')}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                value={adminForm.fullName || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">{t('admin.users.form.email', 'Email Address')}</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                value={adminForm.email || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">{t('admin.users.form.password', 'Password')}</label>
                            <input
                                required
                                type="password"
                                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                value={adminForm.password || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">{t('admin.users.form.phone', 'Phone Number (Optional)')}</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                value={adminForm.phone || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={isCreatingAdmin}
                                className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCreatingAdmin ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : <Shield className="w-4 h-4" />}
                                {isCreatingAdmin ? t('admin.users.form.creating', 'Creating...') : t('admin.users.form.submit', 'Create Admin')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="w-5 h-5 absolute left-4 rtl:right-4 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('admin.users.searchPlaceholder', 'Search by name, email, or role...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-muted-foreground transition-all"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-0">
                    {isLoading ? (
                        <div className="py-24 text-center">
                            <div className="w-12 h-12 border-4 border-stone-800 dark:border-stone-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">{t('admin.users.loading', 'Loading users...')}</p>
                        </div>
                    ) : error ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <UserX className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Error Loading Data</h3>
                            <p className="text-muted-foreground">{t('admin.users.error', 'Failed to fetch users. Please try again.')}</p>
                        </div>
                    ) : usersList.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-4 ring-8 ring-muted/20">
                                <UsersIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{t('admin.users.noUsers', 'No Users Found')}</h3>
                            <p className="text-muted-foreground text-sm">{t('admin.users.noUsersDesc', 'No users match your current search criteria.')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {usersList.map((usr: any) => (
                                <div key={usr.id} className="flex flex-col lg:flex-row items-start lg:items-center p-6 gap-6 hover:bg-muted/30 transition-colors group">
                                    {/* Avatar & Core Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="relative">
                                            <img
                                                src={
                                                    usr.profilePictureUrl
                                                        ? resolveImageUrl(usr.profilePictureUrl)
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(usr.fullName || "User")}&background=random&color=fff`
                                                }
                                                alt={usr.fullName}
                                                className="w-14 h-14 rounded-2xl border border-border object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                            />
                                            {usr.roles?.includes("Admin") && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm text-stone-950 border-2 border-card" title="Administrator">
                                                    <Shield className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-foreground truncate flex items-center gap-2">
                                                {usr.fullName}
                                            </h3>
                                            <div className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
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
                                    <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                                        {usr.isVerified ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                {t('admin.users.table.verified', 'Verified')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">
                                                <UserX className="w-3.5 h-3.5" />
                                                {t('admin.users.table.unverified', 'Unverified')}
                                            </span>
                                        )}
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Joined {new Date(usr.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-none border-border flex flex-col sm:flex-row gap-2">
                                        {!usr.isVerified ? (
                                            <button
                                                onClick={() => handleVerify(usr.id)}
                                                disabled={isVerifying || isDeleting}
                                                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                {t('admin.users.table.verify', 'Verify User')}
                                            </button>
                                        ) : (
                                            <div className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold bg-muted/50 text-muted-foreground rounded-xl border border-transparent cursor-not-allowed">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Fully Verified
                                            </div>
                                        )}
                                        
                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteUser(usr.id, usr.fullName)}
                                            disabled={isVerifying || isDeleting}
                                            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-xl transition-colors disabled:opacity-50"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="lg:hidden">Delete User</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
