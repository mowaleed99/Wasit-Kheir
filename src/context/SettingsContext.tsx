import { createContext, useContext, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface SettingsContextType {
  language: "en" | "ar";
  toggleLanguage: () => void;
  direction: "ltr" | "rtl";
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <SettingsContext.Provider value={{ language, toggleLanguage, direction }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
