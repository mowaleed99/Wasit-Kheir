import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { resolveImageUrl } from "@/utils/imageUrl";

const typeColors: Record<string, string> = {
    LostItem: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    FoundItem: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    LostPerson: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    FoundPerson: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

interface ReportCardProps {
    report: any;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
    const { t } = useTranslation();
    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return t('reportCard.agoM', { count: diffMins });
        if (diffHours < 24) return t('reportCard.agoH', { count: diffHours });
        return t('reportCard.agoD', { count: diffDays });
    };

    const typeClass = typeColors[report.type] || "bg-muted text-muted-foreground border-border";
    const typeLabel = t(`reportTypes.${report.type}`, { defaultValue: report.type });
    const images = report.images || [];

    return (
        <Link
            to={`/report/${report.id}`}
            className="group bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* Image */}
            {images.length > 0 && (
                <div className="w-full aspect-video sm:aspect-[16/9] bg-muted overflow-hidden relative">
                    <ImageGallery images={images} altText={report.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Type & Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeClass}`}>
                        {typeLabel}
                    </span>
                    {report.lifecycleStatus && !["Pending", "Approved", "Rejected", "Flagged", "Active"].includes(report.lifecycleStatus) && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                            {t(`admin.reports.tabs.${report.lifecycleStatus}`, { defaultValue: report.lifecycleStatus })}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {report.title}
                </h3>

                {/* Description */}
                {report.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{report.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
                    {report.locationName && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.locationName}
                        </span>
                    )}
                    {report.subCategoryName && (
                        <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {t(`subcategories.${report.subCategoryName}`, { defaultValue: report.subCategoryName })}
                        </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {formatTime(report.createdAt)}
                    </span>
                </div>

                {/* Creator */}
                {report.createdByName && (
                    <div className="flex items-center gap-2 mt-2">
                        <img
                            src={
                                report.createdByProfilePictureUrl
                                    ? resolveImageUrl(report.createdByProfilePictureUrl)
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(report.createdByName)}&background=random&color=fff`
                            }
                            alt={report.createdByName}
                            className="w-6 h-6 rounded-full object-cover border border-border"
                        />
                        <span className="text-xs text-muted-foreground">{report.createdByName}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};
