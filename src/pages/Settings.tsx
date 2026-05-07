import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { User, Globe, Bell, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Settings: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { language, toggleLanguage } = useSettings();
    const { theme, setTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-foreground">{t('settings.title')}</h1>

            {/* Account Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center space-x-2 mb-4">
                        <User className="w-5 h-5 text-muted-foreground rtl:ml-2 rtl:mr-0" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.account')}</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                {t('settings.fullName')}
                            </label>
                            <p className="text-foreground">{user?.fullName || t('settings.notSet')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                {t('settings.email')}
                            </label>
                            <p className="text-foreground">{user?.email || t('settings.notSet')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                {t('settings.phone')}
                            </label>
                            <p className="text-foreground">{user?.phone || t('settings.notSet')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Language Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-muted-foreground rtl:ml-2 rtl:mr-0" />
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
                <div className="p-6 border-b border-border">
                    <div className="flex items-center space-x-2 mb-4">
                        <Bell className="w-5 h-5 text-muted-foreground rtl:ml-2 rtl:mr-0" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.notifications')}</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">{t('settings.pushNotifications')}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.pushDesc')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {notificationsEnabled ? t('settings.on') : t('settings.off')}
                                </span>
                                <button
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-background ${notificationsEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center space-x-2 mb-4">
                        <Moon className="w-5 h-5 text-muted-foreground rtl:ml-2 rtl:mr-0" />
                        <h2 className="text-xl font-semibold text-foreground">{t('settings.appearance')}</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{t('settings.darkMode')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.toggleTheme')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                {theme === 'dark' ? t('settings.on') : t('settings.off')}
                            </span>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-background ${theme === 'dark' ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                                    }`}
                                aria-label="Toggle dark mode"
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border">
                <div className="p-6">
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="w-full text-destructive border-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('settings.logout')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
