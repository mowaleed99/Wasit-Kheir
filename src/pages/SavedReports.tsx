import { useGetApiUsersMeSavedReports } from "@/api/generated/users/users";
import { ReportCard } from "@/components/reports/ReportCard";
import { useAuth } from "@/context/AuthContext";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

export const SavedReports: React.FC = () => {
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
                <div className="p-2.5 bg-blue-100 rounded-xl">
                    <Bookmark className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Reports</h1>
                    <p className="text-sm text-gray-500">Reports you've bookmarked for later</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500">Loading saved reports…</p>
                </div>
            ) : savedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-5 bg-gray-100 rounded-full mb-4">
                        <Bookmark className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved reports yet</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Browse reports and click the bookmark icon to save them here.
                    </p>
                    <Link
                        to="/"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Browse Reports
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
