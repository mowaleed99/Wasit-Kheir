import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { User, Globe, Bell, Moon, LogOut } from "lucide-react";
import { useState } from "react";

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const { language, toggleLanguage } = useSettings();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {/* Account Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <User className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Account</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <p className="text-gray-900">{user?.fullName || "Not set"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-gray-900">{user?.email || "Not set"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <p className="text-gray-900">{user?.phone || "Not set"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Language Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Language</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Current Language</p>
                            <p className="text-gray-900 font-medium">
                                {language === "en" ? "English" : "العربية"}
                            </p>
                        </div>
                        <Button onClick={toggleLanguage} variant="outline">
                            Switch to {language === "en" ? "Arabic" : "English"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-600">
                                    Receive notifications about new messages and updates
                                </p>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <Moon className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Appearance</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Dark Mode</p>
                            <p className="text-sm text-gray-600">Coming soon</p>
                        </div>
                        <Button variant="outline" disabled>
                            Enable
                        </Button>
                    </div>
                </div>
            </div>

            {/* Logout Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};
