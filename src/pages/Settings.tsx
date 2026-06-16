import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Globe, Bell, Moon, LogOut, Lock, Mail, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
    usePostApiAuthChangePassword,
    usePostApiAuthChangeEmailRequest,
    usePostApiAuthChangeEmailConfirm,
    useDeleteApiAuthDeleteAccount,
} from "@/api/generated/auth/auth";
import { toast } from "sonner";
import { useAppDialog } from "@/context/DialogContext";

export const Settings: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { language, toggleLanguage } = useSettings();
    const { theme, setTheme } = useTheme();
    const { confirm } = useAppDialog();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Section expanders
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [emailStep, setEmailStep] = useState<"request" | "confirm">("request");

    // Password visibility
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    // --- Change Password ---
    const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } =
        useForm<{ currentPassword: string; newPassword: string }>();
    const { mutate: changePassword, isPending: isChangingPwd } = usePostApiAuthChangePassword({
        mutation: {
            onSuccess: () => { toast.success("Password changed successfully!"); resetPwd(); setShowChangePwd(false); },
            onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to change password."),
        }
    });

    // --- Change Email ---
    const { register: regEmailReq, handleSubmit: handleEmailReq, reset: resetEmailReq } = useForm<{ newEmail: string }>();
    const { register: regEmailConfirm, handleSubmit: handleEmailConfirmSubmit, reset: resetEmailConfirm } =
        useForm<{ verificationCode: string }>();
    const { mutate: requestEmailChange, isPending: isRequestingEmail } = usePostApiAuthChangeEmailRequest({
        mutation: {
            onSuccess: () => {
                toast.success("Verification code sent to new email!");
                setEmailStep("confirm");
            },
            onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to request email change."),
        }
    });
    const { mutate: confirmEmailChange, isPending: isConfirmingEmail } = usePostApiAuthChangeEmailConfirm({
        mutation: {
            onSuccess: () => { toast.success("Email changed! Please log in again."); logout(); },
            onError: (e: any) => toast.error(e?.response?.data?.message || "Verification failed."),
        }
    });

    // --- Delete Account ---
    const { register: regDelete, handleSubmit: handleDeleteSubmit } = useForm<{ password: string }>();
    const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteApiAuthDeleteAccount({
        mutation: {
            onSuccess: () => { toast.success("Account deleted."); logout(); },
            onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete account."),
        }
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-foreground">{t('settings.title')}</h1>

            {/* Account Info Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.account')}</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('settings.fullName')}</label>
                            <p className="text-foreground">{user?.fullName || t('settings.notSet')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('settings.email')}</label>
                            <p className="text-foreground">{user?.email || t('settings.notSet')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('settings.phone')}</label>
                            <p className="text-foreground">{user?.phone || t('settings.notSet')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6 overflow-hidden">
                <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setShowChangePwd(!showChangePwd)}
                >
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        <span className="text-lg font-semibold text-foreground">Change Password</span>
                    </div>
                    {showChangePwd ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
                {showChangePwd && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                        <form
                            onSubmit={handlePwd((data) =>
                                changePassword({ data: { currentPassword: data.currentPassword, newPassword: data.newPassword } })
                            )}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPwd ? "text" : "password"}
                                        {...regPwd("currentPassword", { required: "Required" })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {pwdErrors.currentPassword && <p className="text-destructive text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="newPassword"
                                        type={showNewPwd ? "text" : "password"}
                                        {...regPwd("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {pwdErrors.newPassword && <p className="text-destructive text-xs mt-1">{pwdErrors.newPassword.message}</p>}
                            </div>
                            <Button type="submit" disabled={isChangingPwd} className="flex items-center gap-2">
                                {isChangingPwd && <Loader2 className="w-4 h-4 animate-spin" />}
                                Update Password
                            </Button>
                        </form>
                    </div>
                )}
            </div>

            {/* Change Email */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6 overflow-hidden">
                <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setShowChangeEmail(!showChangeEmail)}
                >
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="text-lg font-semibold text-foreground">Change Email</span>
                    </div>
                    {showChangeEmail ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
                {showChangeEmail && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                        {emailStep === "request" ? (
                            <form
                                onSubmit={handleEmailReq((data) => requestEmailChange({ data: { newEmail: data.newEmail } }))}
                                className="space-y-4"
                            >
                                <p className="text-sm text-muted-foreground">Enter your new email. We'll send a verification code.</p>
                                <div>
                                    <Label htmlFor="newEmail">New Email</Label>
                                    <Input id="newEmail" type="email" className="mt-1" {...regEmailReq("newEmail", { required: "Required" })} />
                                </div>
                                <Button type="submit" disabled={isRequestingEmail} className="flex items-center gap-2">
                                    {isRequestingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Send Verification Code
                                </Button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleEmailConfirmSubmit((data) => confirmEmailChange({ data: { verificationCode: data.verificationCode } }))}
                                className="space-y-4"
                            >
                                <p className="text-sm text-muted-foreground">Enter the verification code sent to your new email.</p>
                                <div>
                                    <Label htmlFor="verificationCode">Verification Code</Label>
                                    <Input id="verificationCode" className="mt-1" {...regEmailConfirm("verificationCode", { required: "Required" })} />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={isConfirmingEmail} className="flex items-center gap-2">
                                        {isConfirmingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Confirm Change
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => { setEmailStep("request"); resetEmailReq(); resetEmailConfirm(); }}>
                                        Back
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {/* Language Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.language')}</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('settings.currentLanguage')}</p>
                            <p className="text-foreground font-medium">
                                {language === "en" ? t('settings.english') : t('settings.arabic')}
                            </p>
                        </div>
                        <Button onClick={toggleLanguage} variant="outline" className="border-border text-foreground hover:bg-muted">
                            {t('settings.switchLanguage', { lang: language === "en" ? t('settings.arabic') : t('settings.english') })}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.notifications')}</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{t('settings.pushNotifications')}</p>
                            <p className="text-sm text-muted-foreground">{t('settings.pushDesc')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                {notificationsEnabled ? t('settings.on') : t('settings.off')}
                            </span>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-background ${notificationsEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Moon className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.appearance')}</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{t('settings.darkMode')}</p>
                            <p className="text-sm text-muted-foreground">{t('settings.toggleTheme')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                {theme === 'dark' ? t('settings.on') : t('settings.off')}
                            </span>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-background ${theme === 'dark' ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"}`}
                                aria-label="Toggle dark mode"
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6">
                    <Button onClick={logout} variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10">
                        <LogOut className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('settings.logout')}
                    </Button>
                </div>
            </div>

            {/* Delete Account */}
            <div className="bg-card rounded-lg shadow-sm border border-red-200 dark:border-red-900/40 mb-6 overflow-hidden">
                <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors"
                    onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                >
                    <div className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Account</span>
                    </div>
                    {showDeleteAccount ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
                {showDeleteAccount && (
                    <div className="px-6 pb-6 border-t border-red-200 dark:border-red-900/40 pt-4">
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">⚠️ This action is permanent and cannot be undone.</p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                All your reports, chats, and data will be permanently deleted.
                            </p>
                        </div>
                        <form
                            onSubmit={handleDeleteSubmit(async (data) => {
                                if (await confirm("Are you absolutely sure? This cannot be undone.")) {
                                    deleteAccount({ data: { password: data.password } });
                                }
                            })}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="deletePassword">Confirm your current password</Label>
                                <Input
                                    id="deletePassword"
                                    type="password"
                                    className="mt-1"
                                    {...regDelete("password", { required: "Password is required" })}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isDeletingAccount}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                                {isDeletingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Trash2 className="w-4 h-4" />
                                Delete My Account Permanently
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
