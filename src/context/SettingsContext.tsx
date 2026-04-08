import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  const savedLang = (localStorage.getItem("lang") as "en" | "ar") || "ar";
  const [language, setLanguage] = useState<"en" | "ar">(savedLang);
  const { i18n } = useTranslation();

  // Sync i18n on first mount
  useEffect(() => {
    i18n.changeLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    if (language === "ar") {
      document.body.classList.add("font-cairo");
    } else {
      document.body.classList.remove("font-cairo");
    }
  }, [language]);

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
