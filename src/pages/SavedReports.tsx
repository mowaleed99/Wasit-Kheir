import { useGetApiUsersMeSavedReports } from "@/api/generated/users/users";
import { ReportCard } from "@/components/reports/ReportCard";
import { useAuth } from "@/context/AuthContext";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const SavedReports: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const { data: savedData, isLoading } = useGetApiUsersMeSavedReports({
        query: { enabled: !!user?.id }
    });

    const rawSavedList = (savedData as any)?.data?.data || (savedData as any)?.data || savedData;
    const extractedArray = Array.isArray(rawSavedList) ? rawSavedList : (rawSavedList?.reports || []);
    const savedList: any[] = Array.isArray(extractedArray) ? extractedArray : [];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('savedReports.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('savedReports.subtitle')}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground">{t('savedReports.loading')}</p>
                </div>
            ) : savedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-5 bg-muted rounded-full mb-4">
                        <Bookmark className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('savedReports.noReportsYet')}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        {t('savedReports.browseAndBookmark')}
                    </p>
                    <Link
                        to="/"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        {t('savedReports.browseReports')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedList.map((report: any) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                </div>
            )}
        </div>
    );
};
