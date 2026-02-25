import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";

const typeColors: Record<string, string> = {
    LostItem: "bg-red-100 text-red-700 border-red-200",
    FoundItem: "bg-green-100 text-green-700 border-green-200",
    LostPerson: "bg-orange-100 text-orange-700 border-orange-200",
    FoundPerson: "bg-blue-100 text-blue-700 border-blue-200",
};

const typeLabels: Record<string, string> = {
    LostItem: "Lost Item",
    FoundItem: "Found Item",
    LostPerson: "Lost Person",
    FoundPerson: "Found Person",
};

interface ReportCardProps {
    report: any;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const typeClass = typeColors[report.type] || "bg-gray-100 text-gray-700 border-gray-200";
    const typeLabel = typeLabels[report.type] || report.type;
    const firstImage = report.images?.[0]?.imageUrl;
    const imageUrl = firstImage
        ? `https://wasitkheir.runasp.net${firstImage}`
        : null;

    return (
        <Link
            to={`/report/${report.id}`}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* Image */}
            {imageUrl && (
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Type & Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeClass}`}>
                        {typeLabel}
                    </span>
                    {report.lifecycleStatus && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {report.lifecycleStatus}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {report.title}
                </h3>

                {/* Description */}
                {report.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{report.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                    {report.locationName && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.locationName}
                        </span>
                    )}
                    {report.subCategoryName && (
                        <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {report.subCategoryName}
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
                                    ? `https://wasitkheir.runasp.net${report.createdByProfilePictureUrl}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(report.createdByName)}&background=random&color=fff`
                            }
                            alt={report.createdByName}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        />
                        <span className="text-xs text-gray-500">{report.createdByName}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};
