import React, { useState } from "react";
import {
    useGetApiUsers,
    usePostApiUsersAdmin,
} from "@/api/generated/users/users";
import { usePutApiAdminUsersIdVerify } from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { Search, CheckCircle, Shield, UserX, UserCheck } from "lucide-react";
import { CreateAdminCommand } from "@/api/generated/lostAndFoundAPI.schemas";
import { useTranslation } from "react-i18next";

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
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{t('admin.users.title')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('admin.users.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Shield className="w-4 h-4 rtl:ml-2 rtl:mr-0" />
                    {showAddAdmin ? t('admin.users.cancel') : t('admin.users.addAdmin')}
                </button>
            </div>

            {showAddAdmin && (
                <div className="mb-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{t('admin.users.createAdminTitle')}</h3>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">{t('admin.users.form.fullName')}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-card"
                                value={adminForm.fullName || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">{t('admin.users.form.email')}</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-card"
                                value={adminForm.email || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">{t('admin.users.form.password')}</label>
                            <input
                                required
                                type="password"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-card"
                                value={adminForm.password || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">{t('admin.users.form.phone')}</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-card"
                                value={adminForm.phone || ""}
                                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end rtl:justify-start">
                            <button
                                type="submit"
                                disabled={isCreatingAdmin}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {isCreatingAdmin ? t('admin.users.form.creating') : t('admin.users.form.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('admin.users.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('admin.users.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 dark:bg-red-900/20">
                        <p className="text-red-600 dark:text-red-400">{t('admin.users.error')}</p>
                    </div>
                ) : usersList.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium text-foreground">{t('admin.users.noUsers')}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{t('admin.users.noUsersDesc')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left rtl:text-right border-collapse">
                            <thead>
                                <tr className="bg-muted border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="px-6 py-4 font-semibold">{t('admin.users.table.user')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('admin.users.table.contact')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('admin.users.table.joined')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('admin.users.table.status')}</th>
                                    <th className="px-6 py-4 font-semibold text-right rtl:text-left">{t('admin.users.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {usersList.map((usr: any) => (
                                    <tr key={usr.id} className="hover:bg-muted/50 transition-colors">
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
                                                    className="w-10 h-10 rounded-full border border-border object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-foreground flex items-center gap-1">
                                                        {usr.fullName}
                                                        {usr.roles?.includes("Admin") && (
                                                            <div title={t('admin.users.table.admin')} className="mx-1 inline-flex">
                                                                <Shield className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-muted-foreground">{usr.email}</div>
                                            {usr.phone && <div className="text-xs text-muted-foreground opacity-70 mt-0.5">{usr.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(usr.createdAt).toLocaleDateString(t('settings.currentLanguage') === t('settings.arabic') ? 'ar-EG' : 'en-US')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {usr.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {t('admin.users.table.verified')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                                    <UserX className="w-3 h-3" />
                                                    {t('admin.users.table.unverified')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right rtl:text-left">
                                            {!usr.isVerified && (
                                                <button
                                                    onClick={() => handleVerify(usr.id)}
                                                    disabled={isVerifying}
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                                                >
                                                    <UserCheck className="w-4 h-4 rtl:ml-1 rtl:mr-0" />
                                                    {t('admin.users.table.verify')}
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
