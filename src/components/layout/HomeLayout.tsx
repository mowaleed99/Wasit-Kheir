import { Outlet } from "react-router-dom";
import { CategoryTree } from "../categories/CategoryTree";
import { ChatList } from "../chat/ChatList";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import { Navbar } from "./Navbar";

export const HomeLayout: React.FC = () => {
  const { direction } = useSettings();
  const { t } = useTranslation();

  return (
    <div
      className={`flex h-screen flex-col ${direction === "rtl" ? "rtl" : ""}`}
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Categories */}
        <div className="w-64 bg-muted/40 border-r p-4 overflow-y-auto hidden md:block">
          <h2 className="font-bold mb-4">
            {t("categories.title") || "Categories"}
          </h2>
          <CategoryTree />
        </div>
        {/* Center: Feed */}
        <div className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </div>
        {/* Right: Chats */}
        <div className="w-80 bg-muted/40 border-l p-4 hidden lg:flex lg:flex-col">
          <h2 className="font-bold mb-4">{t("chat.chats")}</h2>
          <ChatList />
        </div>
      </div>
    </div>
  );
};
