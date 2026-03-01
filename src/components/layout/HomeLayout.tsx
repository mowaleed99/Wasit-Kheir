import { Outlet } from "react-router-dom";
import { CategoryTree } from "../categories/CategoryTree";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

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
        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4 relative">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
